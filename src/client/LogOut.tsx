"use client";

import { logOut } from "../server-actions/actions";

export default function LogOut() {
    return <button onClick={() => logOut()}>Log out</button>;
}
