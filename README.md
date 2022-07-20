# lofy
```bash
rustup target add wasm32-unknown-unknown

# Bundling tool
cargo install trunk

# Create WASM output
trunk build [--release]

# Serve the output
go-serve --webroot dist

# Serve with hot-reload
trunk serve
```
