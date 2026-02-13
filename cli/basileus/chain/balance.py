import time

from rich.console import Console
from rich.live import Live
from rich.spinner import Spinner
from web3 import Web3

from basileus.chain.constants import (
    BASE_RPC_URL,
    ERC20_BALANCE_ABI,
    USDC_ADDRESS,
    USDC_DECIMALS,
)

console = Console()


def get_usdc_balance(w3: Web3, address: str) -> float:
    """Get USDC balance for address. Returns human-readable float."""
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(USDC_ADDRESS),
        abi=ERC20_BALANCE_ABI,
    )
    raw = contract.functions.balanceOf(Web3.to_checksum_address(address)).call()
    return raw / (10**USDC_DECIMALS)


def wait_for_usdc_funding(
    address: str, min_amount: float = 20.0, poll_interval: int = 5
) -> float:
    """Poll RPC until USDC balance >= min_amount. Returns final balance."""
    w3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))

    with Live(
        Spinner("dots", text=f"Waiting for USDC deposit to {address}..."),
        console=console,
        transient=True,
    ):
        while True:
            balance = get_usdc_balance(w3, address)
            if balance >= min_amount:
                return balance
            time.sleep(poll_interval)
