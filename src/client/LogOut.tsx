"use client";

import { logOut } from "../server/actions";

export default function LogOut() {
    return <button onClick={() => logOut()}>Log out</button>;
}
