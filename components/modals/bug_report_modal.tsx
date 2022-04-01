import { Button, Modal } from "react-bootstrap";
import { BugReport } from "../../interfaces/bug_report/bug-report";

interface Props {
  show: boolean;
  onHide: () => void;
  bugReport: BugReport | undefined;
}

export default function BugReportModal(props: Props) {
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
        <h4>{props.bugReport?.name}</h4>
        <p>{props.bugReport?.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
