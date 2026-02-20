import time

from rich.console import Console
from rich.live import Live
from rich.spinner import Spinner
from web3 import Web3

from basileus.chain.constants import BASE_RPC_URL, MIN_ETH_FUNDING

console = Console()


def get_eth_balance(w3: Web3, address: str) -> float:
    """Get native ETH balance for address. Returns human-readable float."""
    raw = w3.eth.get_balance(Web3.to_checksum_address(address))
    return raw / (10**18)


def wait_for_eth_funding(
    address: str, min_amount: float = MIN_ETH_FUNDING, poll_interval: int = 5
) -> float:
    """Poll RPC until ETH balance >= min_amount. Returns final balance."""
    w3 = Web3(Web3.HTTPProvider(BASE_RPC_URL))

    with Live(
        Spinner("dots", text=f"Waiting for ETH deposit to {address}..."),
        console=console,
        transient=True,
    ):
        while True:
            balance = get_eth_balance(w3, address)
            if balance >= min_amount:
                return balance
            time.sleep(poll_interval)
