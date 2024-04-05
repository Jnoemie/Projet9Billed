/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

// NewBill
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

// Store
import mockStore from "../__mocks__/store";

// Router
import router from "../app/Router";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be active", () => {
      const iconMail = screen.getByTestId('icon-mail')
      
      // expected values
      expect(iconMail.className).toBe('active-icon')
    })

    test("Then there are a form to edit new bill", () => {
      const html = NewBillUI({})
      document.body.innerHTML = html
      
      const title = screen.getAllByText("Envoyer une note de frais")
      
      // expected values
      expect(title).toBeTruthy
    })
  })
    
  describe("When I am on NewBill Page and I submit an image in [.jpg.jpeg.png] format", () => {
    beforeEach(() => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      document.body.innerHTML = NewBillUI();
    })
    
    test("Then it should change input file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
      const mockStore = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const inputFile = screen.getByTestId("file");
      
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["picture.png"], "picture.png", { type: "png" })],
        },
      });
      
      // expected values
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("picture.png");
    });
    
    // POST
    test("Then it should create a new bill", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const submitBtn = screen.getByTestId("form-new-bill");
      submitBtn.addEventListener("submit", handleSubmit);
      
      fireEvent.submit(submitBtn);
      
      // expected values
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  
  describe("When I fill in the fields in the right format and I click on submit button", () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      router()
    })

    test("Then I have an error server (500)", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update : jest.fn().mockRejectedValueOnce(false)
        }
      })
    
      const newBill = new NewBill({document,  onNavigate, store: mockStore, localStorage: window.localStorage})
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      
      try {
        fireEvent.submit(form);
      } catch(err) {
        // expected values
        expect(err).toMatch('error');
      }
    })
  })
  
  describe("When an error occurs on API", () => {
    test("POST New Bill and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        
      window.onNavigate(ROUTES_PATH.Bills)
      
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      
      // expected values
      expect(message).toBeTruthy()
    })

    test("POST New Bill and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      
      // expected values
      expect(message).toBeTruthy()
    })
  })
});



beforeEach(() => {
  jest.spyOn(mockStore, "bills");
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
  
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  
  document.body.appendChild(root);
  
  router();
  
  window.onNavigate(ROUTES_PATH.NewBill);
});
