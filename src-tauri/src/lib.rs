#[tauri::command]
fn present_book(x: f64, y: f64, book_id: String) -> String {
    format!(
        "Book {book_id} → {x:.1}, {y:.1} mm on shelf plane — selected and pushed"
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![present_book])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
