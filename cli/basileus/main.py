from basileus.async_typer import AsyncTyper
from basileus.deploy import deploy_command

app = AsyncTyper(
    help="Basileus — Deploy autonomous prediction market agents on Base",
    no_args_is_help=True,
)

app.command(name="deploy")(deploy_command)
