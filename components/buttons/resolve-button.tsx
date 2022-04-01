import { Button, Spinner } from "react-bootstrap";

interface Props {
  isLoading: boolean;
  handleResolution: () => void;
}

export default function ResolveButton({ isLoading, handleResolution }: Props) {
  return (
    <Button onClick={handleResolution} variant="success" disabled={isLoading}>
      {isLoading ? <Spinner animation="border" /> : "Resolve"}
    </Button>
  );
}
