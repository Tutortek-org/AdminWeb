import { Button, Modal } from "react-bootstrap";
import { Topic } from "../../interfaces/topic/topic";

interface Props {
  show: boolean;
  onHide: () => void;
  topic: Topic | undefined;
}

export default function TopicModal(props: Props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Topic details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{props.topic?.name}</h4>
        <p>{props.topic?.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
