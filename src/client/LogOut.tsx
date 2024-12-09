"use client";

import { useCallback } from "react";
import { logOut } from "../server/actions";

export default function LogOut() {
    const clearCache = useCallback(async () => {
        await logOut();
        location.reload();
    }, []);
    return (
        <button onClick={clearCache}>
            <span>Clear Data</span>
        </button>
    );
}
