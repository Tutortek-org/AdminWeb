import { Button, Spinner } from "react-bootstrap";

interface Props {
  isLoading: boolean;
  className: string;
  handleApproval: () => void;
}

export default function RejectButton({
  isLoading,
  className,
  handleApproval,
}: Props) {
  return (
    <Button
      onClick={handleApproval}
      variant="danger"
      disabled={isLoading}
      className={className}
    >
      {isLoading ? <Spinner animation="border" /> : "Reject"}
    </Button>
  );
}
