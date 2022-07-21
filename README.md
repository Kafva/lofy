# lofy
Tech stack: vite, solidjs, typescript and golang

```bash
# Build dependencies
npm i -g vite

# Build the frontend
yarn && vite build

# Run a basic HTTP server
go build && ./lofy

# Development
vite build --watch
```

## Testing
```bash
# Run specific test(s)
go test -v -run get_albums ./server

```
