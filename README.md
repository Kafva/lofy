# lofy

## Installation
```bash
# Build the frontend
npm i -g vite pnpm
pnpm install && vite build

# Build the server
go build && ./lofy

# Development
./live.sh
vite build --watch
```

## Testing
```bash
# Run specific test(s)
go test -v --run get_albums ./server
```
