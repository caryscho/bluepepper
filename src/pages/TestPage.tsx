import { useState, useEffect } from "react";

export default function TestPage() {
    const [text, setText] = useState("");
    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const pastedText = event.clipboardData?.getData("text") || "";

            // 1. 탭과 줄바꿈으로 split
            // 2. 빈 문자열과 공백만 있는 셀 제거
            // 3. ', '로 join
            const replacedText = pastedText
                .split(/[\t\n]/) // 탭과 줄바꿈으로 나누기
                .filter((cell) => cell.trim() !== "") // 빈 셀 제거
                .join(", "); // ', '로 결합

            setText(replacedText);

            // console.log("JSON:", JSON.stringify(pastedText));
            // console.log("탭(\\t) 개수:", (pastedText.match(/\t/g) || []).length);
            // console.log("줄바꿈(\\n) 개수:", (pastedText.match(/\n/g) || []).length);
            // console.log("\n각 문자 상세:");
            // console.log(pastedText.split('').map((char, i) => {
            //     const code = char.charCodeAt(0);
            //     let display = char;

            //     if (code === 9) display = '\\t (탭)';
            //     else if (code === 10) display = '\\n (줄바꿈)';
            //     else if (code === 13) display = '\\r (캐리지리턴)';
            //     else if (code === 32) display = '(공백)';

            //     return `[${i}]: "${char}" → ${display} (코드: ${code})`;
            // }));
        };

        window.addEventListener("paste", handlePaste);

        // cleanup: 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener("paste", handlePaste);
        };
    }, []);

    return (
        <div className="p-4">
            {/* //T1X75M380804 */}
            <p className="mb-2 text-lg font-bold">paste text</p>
            <p className="mb-2">replaced text: {text}</p>
        </div>
    );
}
