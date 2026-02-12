from eth_account import Account


def generate_wallet() -> tuple[str, str]:
    """Generate a new Ethereum wallet. Returns (address, private_key_hex)."""
    account = Account.create()
    return account.address, f"0x{account.key.hex()}"
