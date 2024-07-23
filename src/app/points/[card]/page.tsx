import { addPoints } from "../../../server-actions/actions";

export default async function App({ params }: { params: { card: string } }) {
    const points = await addPoints(params.card);
    return (
        <main>
            Points
            <code>
                <pre>{JSON.stringify(points, null, 2)}</pre>
            </code>
        </main>
    );
}
