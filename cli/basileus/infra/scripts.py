INSTALL_NODE_SCRIPT = r"""#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs unzip
npm install -g tsx
"""

DEPLOY_CODE_SCRIPT = r"""#!/bin/bash
set -euo pipefail
rm -rf /opt/basileus
mkdir -p /opt/basileus
unzip -o /tmp/basileus-agent.zip -d /opt/basileus
"""

INSTALL_DEPS_SCRIPT = r"""#!/bin/bash
set -euo pipefail
cd /opt/basileus
npm install --omit=dev
npm rebuild
"""

CONFIGURE_SERVICE_SCRIPT = r"""#!/bin/bash
set -euo pipefail

cat > /etc/systemd/system/basileus-agent.service <<'UNIT'
[Unit]
Description=Basileus Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/env tsx src/index.ts
WorkingDirectory=/opt/basileus
Environment=PATH=/usr/bin:/usr/local/bin:/opt/basileus/node_modules/.bin
Restart=on-failure
RestartSec=10
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable basileus-agent
systemctl start basileus-agent
"""
