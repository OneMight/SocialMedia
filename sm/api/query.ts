export async function uploadPhoto(file: any) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:8000/analyze-emotion', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        
        if (result.status === "success") {
            console.log("Эмоция:", result.dominant_emotion);
            alert(`Система определила эмоцию: ${result.dominant_emotion}`);
        } else {
            console.error("Ошибка сервера:", result.message);
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}