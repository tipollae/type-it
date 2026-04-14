let pyodide;
let currentLine = "";

let controlArray;
let inputBytes;

self.onmessage = async (event) => {
    const { type, code, sab, inputBuffer } = event.data;

    if (type === "init") {
        importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");

        pyodide = await loadPyodide();

        controlArray = new Int32Array(sab);
        inputBytes = new Uint8Array(inputBuffer);

        pyodide.setStdout({
            raw: (byte) => {
                const ch = String.fromCharCode(byte);

                currentLine += ch;

                if (ch === "\n") {
                    self.postMessage({
                        type: "stdout",
                        output: currentLine
                    });
                    currentLine = "";
                }
            }
        });

        pyodide.setStderr({
            batched: (output) => {
                self.postMessage({ type: "stderr", output });
            }
        });

        pyodide.setStdin({
            stdin: () => {
                self.postMessage({
                    type: "get_input",
                    text: currentLine
                });

                Atomics.store(controlArray, 0, 0);
                Atomics.wait(controlArray, 0, 0);

                const len = Atomics.load(controlArray, 1);
                const bytes = inputBytes.slice(0, len);
                const value = new TextDecoder().decode(bytes);

                self.postMessage({
                    type: "display_input",
                    text: currentLine,
                    value: value
                });

                currentLine = "";

                return value;
            }
        });

        self.postMessage({ type: "ready" });
    }

    if (type === "run") {
        try {
            currentLine = "";
            const result = await pyodide.runPythonAsync(code);
            self.postMessage({ type: "result", result });
            self.postMessage({ type: "done" });
        } catch (err) {
            self.postMessage({ type: "error", error: String(err) });
            self.postMessage({ type: "done" });
        }
    }
};