# Debug: List files to confirm structure
ls -F
ls -F client/ || echo "Client folder not found here"

npm install
npm install --prefix client
npm install --prefix server
# Run Migrations & Seeds on Build (or ideally in Start Command, but this works for simple setup)
# Note: Render executes this during build. To run against the DB, the DB must be accessible.
# If DB is private, this might fail during build if build env can't reach it.
# BUT Render "Build" vs "Start".
# Safe bet: Put it in render-build.sh, assuming env vars (DATABASE_URL) are available during build? 
# Render documentation says env vars are available during build.
# However, connecting to the DB during build phase might not always work if it's an internal DB.
# Let's try. If it fails, we move it to start command `node server/server.js` wrapper.
cd server
npx sequelize-cli db:migrate --env production
npx sequelize-cli db:seed:all --env production
cd ..

npm run build --prefix client

# Debug: Check if build folder exists
echo "Checking build output..."
ls -F client/build/ || echo "Client build folder missing!"
