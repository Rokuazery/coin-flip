#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// #[macro_use]
// extern crate lazy_static;

use rand::Rng; // 0.8.0
use std::cell::RefCell;

const COIN_FACES: [&str; 2] = ["HEADS", "TAILS"];
// static mut FLIP_HISOTRY: Vec<String> = Vec::new();
thread_local!(static HEADS_AMOUNT: RefCell<u32> = RefCell::new(0));
thread_local!(static TAILS_AMOUNT: RefCell<u32> = RefCell::new(0));
thread_local!(static FLIP_HISOTRY: RefCell<Vec<String>> = RefCell::new(vec![]));

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            flip_coin,
            get_flip_history,
            get_heads_amount,
            get_tails_amount,
            clear_flip_history,
            open_github_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn flip_coin() -> String {
    let index = rand::thread_rng().gen_range(0..2);
    let face = COIN_FACES[index].to_string();

    FLIP_HISOTRY.with(|history| {
        let coin_history = format!("[{}] {}", { history.borrow().len() + 1 }, face);
        history.borrow_mut().push(coin_history);
    });

    return face;
}

#[tauri::command]
fn get_flip_history() -> Vec<String> {
    FLIP_HISOTRY.with(|history| {
        let history_vec = &history.borrow();

        if history_vec.len() > 0 {
            let _result = &history_vec[history_vec.len() - 1];

            if _result.contains(&COIN_FACES[0]) {
                HEADS_AMOUNT.with(|amount| {
                    *amount.borrow_mut() += 1;
                });
            } else {
                TAILS_AMOUNT.with(|amount| {
                    *amount.borrow_mut() += 1;
                });
            }
        }

        return history.borrow().to_vec();
    })
}

#[tauri::command]
fn clear_flip_history() {
    FLIP_HISOTRY.with(|history| {
        history.borrow_mut().clear();
    });
    TAILS_AMOUNT.with(|amount| {
        *amount.borrow_mut() = 0;
    });
    HEADS_AMOUNT.with(|amount| {
        *amount.borrow_mut() = 0;
    });
}

#[tauri::command]
fn open_github_url() {
    open::that("https://github.com/Rokuazery").unwrap();
}

#[tauri::command]
fn get_heads_amount() -> u32 {
    HEADS_AMOUNT.with(|h| {
        return *h.borrow();
    })
}

#[tauri::command]
fn get_tails_amount() -> u32 {
    TAILS_AMOUNT.with(|t| {
        return *t.borrow();
    })
}

//thread_local!(static FLIP_HISOTRY: RefCell<Vec<String>> = RefCell::new(vec![]);
