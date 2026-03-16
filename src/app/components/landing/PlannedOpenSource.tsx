"use client";

import { motion } from "framer-motion";
import { Coffee, Star, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// real code snippets from the actual colorwall codebase
const CODE_SNIPPETS = [
    {
        file: "platform/windows/engine.rs",
        lines: [
            { text: "/// creates a windows video wallpaper on a specific monitor", type: "comment" },
            { text: "pub fn create_wallpaper_on_monitor(", type: "fn" },
            { text: "    app: &AppHandle,", type: "param" },
            { text: '    video_path: &str,', type: "param" },
            { text: "    monitor_id: Option<&str>,", type: "param" },
            { text: ") -> Result<(), String> {", type: "fn" },
            { text: "    let _permit = WALLPAPER_SEMAPHORE.try_acquire().ok();", type: "code" },
            { text: "", type: "empty" },
            { text: "    let (backend, mpv_path, audio, paused, auto_pause)", type: "code" },
            { text: "        = load_player_settings();", type: "code" },
            { text: "", type: "empty" },
            { text: "    spawn_player(app, &video_path_str, width, height,", type: "code" },
            { text: "        &backend, mpv_path.as_deref(),", type: "code" },
            { text: "        audio, paused, auto_pause, monitor_id)?;", type: "code" },
            { text: "", type: "empty" },
            { text: "    Ok(())", type: "keyword" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/taskbar.rs",
        lines: [
            { text: "/// undocumented win32 apis for acrylic/blur effects", type: "comment" },
            { text: "#[repr(C)]", type: "attr" },
            { text: "struct AccentPolicy {", type: "fn" },
            { text: "    accent_state: u32,", type: "param" },
            { text: "    gradient_color: u32,", type: "param" },
            { text: "}", type: "fn" },
            { text: "", type: "empty" },
            { text: "pub fn set_taskbar_effect(", type: "fn" },
            { text: "    effect: TaskbarEffect,", type: "param" },
            { text: "    opacity: f32,", type: "param" },
            { text: ") -> Result<(), String> {", type: "fn" },
            { text: "    match effect {", type: "keyword" },
            { text: "        Acrylic => {", type: "keyword" },
            { text: "            policy.accent_state = ACCENT_ENABLE_ACRYLICBLURBEHIND;", type: "code" },
            { text: "            let alpha = (opacity * 255.0) as u8;", type: "code" },
            { text: "            policy.gradient_color = rgb_to_abgr(color, alpha);", type: "code" },
            { text: "        }", type: "keyword" },
            { text: "    }", type: "keyword" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/shell_int.rs",
        lines: [
            { text: "/// injects a window behind the desktop icons", type: "comment" },
            { text: "/// uses the WorkerW / Progman trick", type: "comment" },
            { text: "pub fn inject_behind_desktop(", type: "fn" },
            { text: "    hwnd: HWND,", type: "param" },
            { text: "    x: i32, y: i32,", type: "param" },
            { text: "    width: i32, height: i32,", type: "param" },
            { text: ") -> Result<(), String> {", type: "fn" },
            { text: '    let progman = FindWindowA(s!("Progman"), None)?;', type: "code" },
            { text: "    SendMessageTimeoutA(progman, 0x052C,", type: "code" },
            { text: "        WPARAM(0xD), LPARAM(0x1), ..);", type: "code" },
            { text: "", type: "empty" },
            { text: "    // find the new WorkerW behind Progman", type: "comment" },
            { text: "    let worker_w = find_worker_w()?;", type: "code" },
            { text: "    SetParent(hwnd, worker_w);", type: "code" },
            { text: "    SetWindowPos(hwnd, HWND_TOP, x, y,", type: "code" },
            { text: "        width, height, SWP_SHOWWINDOW);", type: "code" },
            { text: "    Ok(())", type: "keyword" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/wmf/player.rs",
        lines: [
            { text: "/// hardware-accelerated video player via D3D11 + WMF", type: "comment" },
            { text: "pub struct WmfPlayer {", type: "fn" },
            { text: "    hwnd: HWND,", type: "param" },
            { text: "    media_engine: Option<IMFMediaEngine>,", type: "param" },
            { text: "    _d3d_device: Option<ID3D11Device>,", type: "param" },
            { text: "}", type: "fn" },
            { text: "", type: "empty" },
            { text: "impl WmfPlayer {", type: "keyword" },
            { text: "    pub fn new(w: i32, h: i32, restart: Arc<AtomicBool>)", type: "fn" },
            { text: "        -> WmfResult<Self> {", type: "fn" },
            { text: "        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);", type: "code" },
            { text: "        let _ = MFStartup(MF_VERSION, MFSTARTUP_FULL);", type: "code" },
            { text: "        let hwnd = create_player_window(w, h)?;", type: "code" },
            { text: "        let d3d = create_d3d_device()?;", type: "code" },
            { text: "        let (engine, cb) = create_media_engine(hwnd, &d3d)?;", type: "code" },
            { text: "        Ok(Self { hwnd, media_engine: Some(engine), .. })", type: "keyword" },
            { text: "    }", type: "fn" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/player_main.rs",
        lines: [
            { text: "/// checks if any fullscreen app is currently running", type: "comment" },
            { text: "fn is_fullscreen_app_running() -> bool {", type: "fn" },
            { text: "    unsafe {", type: "keyword" },
            { text: "        let fg = GetForegroundWindow();", type: "code" },
            { text: "        if fg.0.is_null() { return false; }", type: "code" },
            { text: "", type: "empty" },
            { text: "        // skip our own window, desktop, taskbar", type: "comment" },
            { text: "        let mut class_name = [0u16; 256];", type: "code" },
            { text: "        let name = GetClassNameW(fg, &mut class_name);", type: "code" },
            { text: '        match name.as_str() {', type: "keyword" },
            { text: '            "WorkerW" | "Progman" | "WmfPlayerWindow"', type: "code" },
            { text: '            | "Shell_TrayWnd" => return false,', type: "code" },
            { text: "            _ => {}", type: "keyword" },
            { text: "        }", type: "keyword" },
            { text: "", type: "empty" },
            { text: "        // compare window rect to monitor bounds", type: "comment" },
            { text: "        let monitor = MonitorFromWindow(fg, DEFAULT);", type: "code" },
            { text: "        win_rect.right >= mi.rcMonitor.right", type: "keyword" },
            { text: "    }", type: "fn" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/os_version.rs",
        lines: [
            { text: "/// detect windows version via ntdll RtlGetVersion", type: "comment" },
            { text: "fn detect_windows_version() -> WindowsVersion {", type: "fn" },
            { text: "    unsafe {", type: "keyword" },
            { text: "        let mut info: OSVERSIONINFOEXW = std::mem::zeroed();", type: "code" },
            { text: "", type: "empty" },
            { text: '        let ntdll = LoadLibraryW(w!("ntdll.dll"))?;', type: "code" },
            { text: '        let proc = GetProcAddress(ntdll, s!("RtlGetVersion"));', type: "code" },
            { text: "        let rtl_get_version: RtlGetVersion = transmute(proc);", type: "code" },
            { text: "        rtl_get_version(&mut info);", type: "code" },
            { text: "", type: "empty" },
            { text: "        match (info.dwMajorVersion, info.dwBuildNumber) {", type: "keyword" },
            { text: "            (10, b) if b >= 26100 => Windows1124H2Plus,", type: "code" },
            { text: "            (10, b) if b >= 22000 => Windows11Pre24H2,", type: "code" },
            { text: "            (10, _)               => Windows10,", type: "code" },
            { text: "            _                     => Unknown,", type: "keyword" },
            { text: "        }", type: "keyword" },
            { text: "    }", type: "fn" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/wmf/monitors.rs",
        lines: [
            { text: "/// enumerate all display monitors with DPI info", type: "comment" },
            { text: "fn enumerate_monitors() -> Vec<MonitorInfo> {", type: "fn" },
            { text: "    let mut monitors: Vec<MonitorInfo> = Vec::new();", type: "code" },
            { text: "    unsafe {", type: "keyword" },
            { text: "        EnumDisplayMonitors(None, None,", type: "code" },
            { text: "            Some(monitor_enum_callback),", type: "code" },
            { text: "            LPARAM(&mut monitors as *mut _ as isize));", type: "code" },
            { text: "    }", type: "keyword" },
            { text: "", type: "empty" },
            { text: "    for (i, m) in monitors.iter().enumerate() {", type: "keyword" },
            { text: '        println!("[monitors] #{}: {} {}x{} DPI:{}",', type: "code" },
            { text: "            i, m.name,", type: "code" },
            { text: "            m.rect.right - m.rect.left,", type: "code" },
            { text: "            m.rect.bottom - m.rect.top, m.dpi_x);", type: "code" },
            { text: "    }", type: "keyword" },
            { text: "    monitors", type: "keyword" },
            { text: "}", type: "fn" },
        ],
    },
    {
        file: "platform/windows/shell_int.rs",
        lines: [
            { text: "/// win11 injection - Progman > SHELLDLL_DefView method", type: "comment" },
            { text: "unsafe fn inject_windows_11(", type: "fn" },
            { text: "    hwnd: HWND, progman: HWND,", type: "param" },
            { text: "    x: i32, y: i32, w: i32, h: i32,", type: "param" },
            { text: ") -> Result<(), String> {", type: "fn" },
            { text: "    SendMessageTimeoutW(progman, 0x052C, ..);", type: "code" },
            { text: "", type: "empty" },
            { text: '    let shell_view = FindWindowExW(Some(progman),', type: "code" },
            { text: '        None, w!("SHELLDLL_DefView"), PCWSTR::null())?;', type: "code" },
            { text: "", type: "empty" },
            { text: "    let mut style = GetWindowLongPtrW(hwnd, GWL_STYLE);", type: "code" },
            { text: "    style &= !(WS_POPUP.0 as isize);", type: "code" },
            { text: "    style |= WS_CHILD.0 as isize;", type: "code" },
            { text: "    SetWindowLongPtrW(hwnd, GWL_STYLE, style);", type: "code" },
            { text: "", type: "empty" },
            { text: "    SetParent(hwnd, Some(progman))?;", type: "code" },
            { text: "    SetWindowPos(hwnd, Some(shell_view),", type: "code" },
            { text: "        rel_x, rel_y, w, h, SWP_NOACTIVATE)?;", type: "code" },
            { text: "    Ok(())", type: "keyword" },
            { text: "}", type: "fn" },
        ],
    },
];

// color map matching monokai-ish theme
const colorMap: Record<string, { text: string; line: string }> = {
    comment: { text: "text-[#75715e]", line: "italic" },
    fn: { text: "text-[#a6e22e]", line: "font-semibold" },
    param: { text: "text-[#fd971f]", line: "" },
    keyword: { text: "text-[#f92672]", line: "" },
    code: { text: "text-[#f8f8f2]", line: "" },
    attr: { text: "text-[#66d9ef]", line: "" },
    empty: { text: "", line: "" },
};

export const PlannedOpenSource = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const codeMuted = isDark ? "text-white/40" : "text-black/40";

    const [snippetIdx, setSnippetIdx] = useState(0);
    const [visibleLines, setVisibleLines] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const snippet = CODE_SNIPPETS[snippetIdx];

    useEffect(() => {
        // reset on snippet change
        setVisibleLines(0);
        setIsTyping(true);
    }, [snippetIdx]);

    useEffect(() => {
        if (!isTyping) return;

        if (visibleLines < snippet.lines.length) {
            const delay = snippet.lines[visibleLines]?.type === "empty" ? 80 : 60 + Math.random() * 60;
            timeoutRef.current = setTimeout(() => {
                setVisibleLines((v) => v + 1);
            }, delay);
        } else {
            // done typing - wait then switch
            timeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                setTimeout(() => {
                    setSnippetIdx((i) => (i + 1) % CODE_SNIPPETS.length);
                }, 800);
            }, 3000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [visibleLines, isTyping, snippet.lines]);

    return (
        <section className="py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden">
            {/* grid background pattern */}
            {/* <div
                className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-10" : "opacity-[0.03]"}`}
                style={{
                    backgroundImage: `linear-gradient(${isDark ? "white" : "black"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "white" : "black"} 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                    maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
                }}
            /> */}

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
                {/* ════ left: animated code window ════ */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-xl overflow-hidden shadow-2xl border flex flex-col font-mono ${isDark ? "bg-[#0f0f11]" : "bg-slate-50"} ${borderColor}`}
                >
                    {/* window chrome */}
                    <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? "bg-[#161618]" : "bg-slate-100"} ${borderColor}`}>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <div className={`text-xs ${codeMuted} transition-all duration-300`}>
                            {snippet.file}
                        </div>
                    </div>

                    {/* animated code content */}
                    <div className="p-5 sm:p-6 min-h-[380px] relative">
                        <div className="space-y-0 text-[13px] leading-[1.7] whitespace-pre font-mono">
                            {snippet.lines.slice(0, visibleLines).map((line, i) => {
                                const colors = colorMap[line.type] || colorMap.code;
                                return (
                                    <motion.div
                                        key={`${snippetIdx}-${i}`}
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex"
                                    >
                                        <span className={`w-8 text-right mr-4 select-none ${codeMuted} text-xs`}>
                                            {i + 1}
                                        </span>
                                        <span className={`${colors.text} ${colors.line}`}>
                                            {line.text}
                                        </span>
                                    </motion.div>
                                );
                            })}

                            {/* blinking cursor */}
                            {isTyping && visibleLines < snippet.lines.length && (
                                <div className="flex">
                                    <span className={`w-8 text-right mr-4 select-none ${codeMuted} text-xs`}>
                                        {visibleLines + 1}
                                    </span>
                                    <span className="w-2 h-5 bg-[#a6e22e] animate-pulse inline-block" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* window footer */}
                    <div className={`px-4 py-3 border-t flex items-center justify-between text-xs font-medium ${isDark ? "bg-[#161618]" : "bg-slate-100"} ${borderColor} ${codeMuted}`}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#dea584]" />
                                Rust
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Lock size={12} />
                                soon to be open source
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold border ${isDark ? "bg-white/5 border-white/10 text-white/60" : "bg-black/5 border-black/10 text-black/60"}`}>
                                <Star size={10} className="text-[#ffbd2e] fill-[#ffbd2e]" />
                                Star
                            </div>
                            {/* snippet dots */}
                            <div className="flex gap-1.5">
                                {CODE_SNIPPETS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                            i === snippetIdx
                                                ? "bg-[#a6e22e] w-4"
                                                : isDark
                                                  ? "bg-white/20"
                                                  : "bg-black/20"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ════ right: content ════ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center"
                >
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                        <span className={isDark ? "text-white" : "text-black"}>Planned</span>
                        <br />
                        <span className="text-[#00A4FF] drop-shadow-sm">Open Source</span>
                    </h2>

                    <p className={`text-base leading-relaxed ${mutedText}`}>
                        ColorWall is currently closed-source to protect our unique optimization logic in the age of AI. We are self-funding the Microsoft Store developer license and distribution costs. Once our infrastructure is secured, we plan to open-source the project for the community.
                    </p>

                    <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-black/10"} my-8 shadow-sm`} />

                    <p className={`text-sm sm:text-base mb-6 font-medium ${mutedText}`}>
                        If you would like to support the project and help accelerate open-sourcing efforts, you can contribute here:
                    </p>

                    <div>
                        <a
                            href="https://ko-fi.com/laxenta"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#00A4FF] to-[#007AC2] hover:shadow-[0_0_20px_rgba(0,164,255,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <Coffee size={18} className="fill-white" />
                            Support on Ko-fi
                        </a>
                    </div>

                    <p className={`mt-6 text-sm italic opacity-70 ${mutedText}`}>
                        Community support directly helps with licensing, signing certificates, and long-term development.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
