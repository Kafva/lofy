#[macro_export]
macro_rules! log {
    // Match a fmt literal + one or more expressions
    ( $fmt:literal, $($x:expr),* ) => (
       console::log_1(&JsValue::from(format!($fmt, $($x)*)))
    );
    // Match one or more expressions
    ( $($x:expr),* ) => (
       console::log_1(&JsValue::from($($x)*))
    )
}

