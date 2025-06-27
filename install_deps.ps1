# PowerShell script to install all dependencies for Huddle_Frontend with compatibility flags
# Run this script in PowerShell: ./install_deps.ps1

Write-Host "Installing all dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps

Write-Host "Ensuring compatible eslint-plugin-react-hooks version..."
npm install eslint-plugin-react-hooks@4.6.2 --save-dev --legacy-peer-deps

Write-Host "All dependencies installed. You can now run 'npm start'!"
