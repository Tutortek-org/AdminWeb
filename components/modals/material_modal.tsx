import { Button, Modal } from "react-bootstrap";
import { Material } from "../../interfaces/material/material";
import Link from "next/link";

interface Props {
  show: boolean;
  onHide: () => void;
  material: Material | undefined;
}

export default function MaterialModal(props: Props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Learning material details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{props.material?.name}</h4>
        <p>{props.material?.description}</p>
        Link:
        <div style={{ display: "inline-block" }}>
          {" "}
          <Link href={`https://${props.material?.link}`}>
            <a className="nav-link">{props.material?.link}</a>
          </Link>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
