# Debug: List files to confirm structure
ls -F
ls -F client/ || echo "Client folder not found here"

npm install
npm install --prefix client
npm install --prefix server
npm run build --prefix client
