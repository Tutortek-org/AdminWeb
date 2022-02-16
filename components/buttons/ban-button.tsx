import { useState } from "react";
import { Button } from "react-bootstrap";
import { User } from "../../interfaces/user";

interface Props {
  isBanned: boolean;
  handleBan: () => void;
}

export default function BanButton({ isBanned, handleBan }: Props) {
  return (
    <Button onClick={handleBan} variant={isBanned ? "success" : "danger"}>
      {isBanned ? "Unban" : "Ban"}
    </Button>
  );
}
