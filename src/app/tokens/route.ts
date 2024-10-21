import { delinkAccessTokens } from "@/server/actions";

export async function GET() {
    try {
        await delinkAccessTokens();
        return Response.json({ status: 200, body: "Delinked access tokens" });
    } catch (error) {
        console.error(error);
        return Response.json({
            status: 500,
            body: "Failed to delink access tokens",
        });
    }
}
