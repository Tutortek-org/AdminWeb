import { Button, Spinner } from "react-bootstrap";

interface Props {
  isBanned: boolean;
  isLoading: boolean;
  handleBan: () => void;
}

export default function BanButton({ isBanned, isLoading, handleBan }: Props) {
  return (
    <Button
      onClick={handleBan}
      variant={isBanned ? "success" : "danger"}
      disabled={isLoading}
    >
      {isLoading ? <Spinner animation="border" /> : isBanned ? "Unban" : "Ban"}
    </Button>
  );
}
