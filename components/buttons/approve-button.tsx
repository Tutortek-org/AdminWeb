import { Button, Spinner } from "react-bootstrap";

interface Props {
  isLoading: boolean;
  handleApproval: () => void;
}

export default function ApproveButton({ isLoading, handleApproval }: Props) {
  return (
    <Button onClick={handleApproval} variant="success" disabled={isLoading}>
      {isLoading ? <Spinner animation="border" /> : "Approve"}
    </Button>
  );
}
