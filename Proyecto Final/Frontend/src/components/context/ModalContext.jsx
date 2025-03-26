// ModalContext.js
import { createContext, useState, useContext } from "react";

const ModalContextBooks = createContext();

export const ModalProviderBooks = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [showModalDeleteBook, setShowModalDeleteBook] = useState(false);
  const [showModalUpdateBook, setShowModalUpdateBook] = useState(false);
  const [dataBook, setDataBook] = useState(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openModalDeletedBook = (datos) => {
    setShowModalDeleteBook(true);
    setDataBook(datos);
  }
  const closeModalDeleteBook = () => setShowModalDeleteBook(false);

  const openModalUpdatedBook = (datos) => {
    console.log(datos);
    
    setShowModalUpdateBook(true);
    setDataBook(datos);
  }
  const closeModalUpdateBook = () => setShowModalUpdateBook(false);

  return (
    <ModalContextBooks.Provider value={{ 
      showModal, openModal, closeModal,
      showModalDeleteBook, openModalDeletedBook, closeModalDeleteBook, dataBook,
      showModalUpdateBook, openModalUpdatedBook, closeModalUpdateBook
    }}>
      {children}
    </ModalContextBooks.Provider>
  );
};

export const useModal = () => useContext(ModalContextBooks);