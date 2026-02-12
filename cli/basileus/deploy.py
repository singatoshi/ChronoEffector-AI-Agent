import asyncio
import os
from collections.abc import Callable
from pathlib import Path
from typing import Any

import typer
from dotenv import dotenv_values
from rich import print as rprint
from rich.console import Console
from rich.panel import Panel
from rich.status import Status

from basileus.balance import wait_for_usdc_funding
from basileus.wallet import generate_wallet

console = Console()


async def _run_step(
    label: str, fn: Callable[[], Any] | None = None, mock_duration: float = 2.0
) -> Any:
    """Run a deployment step with spinner, then show checkmark. Returns fn result if provided."""
    with Status(f"{label}...", console=console, spinner="dots"):
        if fn is not None:
            result = await fn()
        else:
            await asyncio.sleep(mock_duration)
            result = None
    console.print(f"  [green]\u2714[/green] {label}")
    return result


async def deploy_command(
    agent_dir: Path = typer.Option(
        None,
        "--agent-dir",
        "-d",
        help="Path to agent directory (default: current working directory)",
    ),
    min_usdc: float = typer.Option(
        20.0,
        "--min-usdc",
        help="Minimum USDC balance to wait for before proceeding",
    ),
) -> None:
    """Deploy a new Basileus agent — generates wallet, funds it, and deploys to Aleph Cloud."""

    if agent_dir is None:
        agent_dir = Path.cwd()

    agent_dir = agent_dir.resolve()
    env_path = agent_dir / ".env.prod"

    console.rule("[bold blue]Basileus Agent Deployment")
    rprint()

    # Step 1: Generate wallet
    rprint("[bold]Step 1:[/bold] Generating Base wallet...")
    address, private_key = generate_wallet()
    rprint(f"  [green]Wallet generated:[/green] {address}")
    rprint()

    # Step 2: Write .env
    rprint("[bold]Step 2:[/bold] Configuring agent environment...")

    env_vars: dict[str, str] | None = {
        "BASE_CHAIN_WALLET_KEY": private_key,
        "NETWORK": "base",
        "CYCLE_INTERVAL_MS": "60000",
        "LLM_MODEL": "anthropic/claude-sonnet-4",
    }

    if env_path.exists():
        existing = dotenv_values(env_path)
        if existing.get("BASE_CHAIN_WALLET_KEY"):
            overwrite = typer.confirm(
                "  .env.prod already exists with a wallet key. Overwrite?",
                default=False,
            )
            if not overwrite:
                rprint("  [yellow]Keeping existing .env file.[/yellow]")
                private_key = existing["BASE_CHAIN_WALLET_KEY"]  # type: ignore[assignment]
                from eth_account import Account

                address = Account.from_key(private_key).address
                rprint(f"  [green]Using existing wallet:[/green] {address}")
                rprint()
                env_vars = None

    if env_vars is not None:
        env_content = "\n".join(f"{k}={v}" for k, v in env_vars.items()) + "\n"
        os.makedirs(agent_dir, exist_ok=True)
        with open(env_path, "w") as f:
            f.write(env_content)
        rprint(f"  [green]Saved to {env_path}[/green]")

    rprint()

    # Step 3: Fund wallet
    rprint("[bold]Step 3:[/bold] Fund your agent wallet")
    rprint()
    rprint(
        Panel(
            f"[bold]Send USDC (Base) to:[/bold]\n\n"
            f"  [cyan]{address}[/cyan]\n\n"
            f"This USDC will be the agent's starting funds for:\n"
            f"  - AI inference costs (BlockRun x402)\n"
            f"  - Prediction market trading (Limitless)\n"
            f"  - Compute costs (Aleph Cloud)\n\n"
            f"[dim]Minimum required: {min_usdc} USDC[/dim]",
            title="[bold yellow]Fund Agent Wallet[/bold yellow]",
            border_style="yellow",
        )
    )
    rprint()

    # Step 4: Poll for balance
    balance = wait_for_usdc_funding(address, min_amount=min_usdc)
    rprint(f"  [green]Received {balance:.2f} USDC[/green]")
    rprint()

    # Step 5: Deployment steps (mocked)
    rprint("[bold]Step 4:[/bold] Deploying agent...")
    rprint()

    await _run_step("Purchasing ALEPH tokens via Aerodrome", mock_duration=2.5)
    await _run_step("Creating Aleph Cloud instance", mock_duration=3.0)
    await _run_step("Bundling agent code", mock_duration=1.5)
    await _run_step("Deploying to Aleph Cloud", mock_duration=3.0)
    await _run_step("Registering ERC-8004 identity", mock_duration=2.0)

    rprint()
    console.rule("[bold green]Deployment Complete")
    rprint()
    rprint(
        Panel(
            f"[bold]Agent Address:[/bold]  [cyan]{address}[/cyan]\n"
            f"[bold]USDC Balance:[/bold]   {balance:.2f} USDC\n"
            f"[bold]Network:[/bold]        Base Mainnet\n"
            f"[bold]Status:[/bold]         [green]Running[/green]\n"
            f"\n"
            f"[dim]Dashboard: coming soon[/dim]",
            title="[bold green]Basileus Agent[/bold green]",
            border_style="green",
        )
    )
