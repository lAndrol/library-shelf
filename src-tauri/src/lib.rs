#[tauri::command]
fn present_book(x: u32, y: u32) -> String {
    format!("Coordinate ({x}, {y}) selected and pushed")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![present_book])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
