# Debug: List files to confirm structure
ls -F
ls -F client/ || echo "Client folder not found here"

npm install
npm run build --prefix client
