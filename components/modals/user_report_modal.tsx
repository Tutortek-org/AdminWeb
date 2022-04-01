import { Button, Modal } from "react-bootstrap";
import { UserReport } from "../../interfaces/user_report/user-report";

interface Props {
  show: boolean;
  onHide: () => void;
  userReport: UserReport | undefined;
}

export default function UserReportModal(props: Props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Bug report details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Reported: {props.userReport?.reported.email}</h4>
        <h4>Reporter: {props.userReport?.reporter.email}</h4>
        <p>{props.userReport?.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
