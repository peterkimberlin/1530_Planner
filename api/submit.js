export default function handler(req, res) {
    if (req.method === 'POST') {
        const { name, contact, message, totalCost } = req.body;
        console.log(`[New Inquiry] Name: ${name} | Contact: ${contact} | Estimated Cost: ${totalCost}`);
        console.log(`Message: ${message}`);

        return res.status(200).json({
            success: true,
            message: "문의가 성공적으로 접수되었습니다. 확인 후 빠른 시일 내에 연락드리겠습니다!"
        });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
