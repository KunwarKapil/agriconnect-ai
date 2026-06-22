import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

import {
  Button,
  Input,
  Modal,
  Toast,
  Loader,
  ThemeToggle,
} from "../components/ui";

function ComponentsDemo() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { darkMode } = useTheme();

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-black"
      }`}
    >
      <h1 className="text-3xl font-bold mb-6">
        Component Library Demo
      </h1>

      <ThemeToggle />

      <div className="my-4">
        <Button
          variant="primary"
          onClick={() => setShowToast(true)}
        >
          Primary Button
        </Button>
      </div>

      <div className="my-4">
        <Input
          label="Name"
          placeholder="Enter your name"
        />
      </div>

      <div className="my-4">
        <Button
          variant="secondary"
          onClick={() => setShowModal(true)}
        >
          Open Modal
        </Button>
      </div>

      <div className="my-8">
        <Loader />
      </div>

      {showToast && (
        <Toast message="Toast Component Working!" />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Demo Modal"
      >
        <p>This is a modal component.</p>
      </Modal>
    </div>
  );
}

export default ComponentsDemo;