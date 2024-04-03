/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
    // Vérifie si un fichier est bien chargé
    test("Then verify the file bill", async () => {
      jest.spyOn(mockStore, "bills");

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["NewBill"] },
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const file = new File(["image"], "image.png", { type: "image/png" });
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const billFile = screen.getByTestId("file");
      userEvent.upload(billFile, file);
      handleChangeFile({
        preventDefault: jest.fn(),
        target: { value: "image.png" },
      });
      console.log(newBillInit);
      expect(billFile.files[0].name).toBeDefined();
      expect(newBillInit.file).toEqual(file);
      expect(newBillInit.fileName).toEqual("image.png");
      expect(handleChangeFile).toBeCalled();

      const formNewBill = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
