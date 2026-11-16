function isoFromToday(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("reserva de um hotel", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("busca São Paulo, escolhe um quarto e confirma a reserva", () => {
    const checkIn = isoFromToday(14);
    const checkOut = isoFromToday(17);
    const expiryYear = String((new Date().getFullYear() + 2) % 100).padStart(
      2,
      "0",
    );

    cy.visit("/");
    cy.get('input[placeholder="Para onde você vai?"]').type("Sao Paulo");
    cy.contains("button", "São Paulo, SP").click();
    cy.get("#check-in").type(checkIn);
    cy.get("#check-out").type(checkOut);
    cy.contains("button", "Buscar").click();

    cy.url().should("include", "/search");
    cy.contains("h1", "Hotéis em São Paulo, SP").should("be.visible");
    cy.get("article").not(":contains(Esgotado)").first().find("h2 a").click();

    cy.url().should("include", "/hotel/");
    cy.contains("button", "Selecionar").should("be.enabled").click();

    cy.url().should("include", "/checkout");
    cy.get("#firstName").type("Ana");
    cy.get("#lastName").type("Lima");
    cy.get("#email").type("ana@example.com");
    cy.get("#phone").type("11988887777");
    cy.get("#document").type("52998224725");
    cy.get("#companion-0-first").type("Leo");
    cy.get("#companion-0-last").type("Lima");
    cy.contains("button", "Continuar").click();

    cy.get("#cardName").type("Ana Lima");
    cy.get("#cardNumber").type("4242424242424242");
    cy.get("#expiry").type(`12${expiryYear}`);
    cy.get("#cvv").type("123");
    cy.contains("button", "Continuar").click();

    cy.contains("label", "Li e aceito os termos").find("input").check();
    cy.contains("button", "Confirmar reserva").click();

    cy.url().should("include", "/confirmation/");
    cy.contains("Reserva confirmada").should("be.visible");
    cy.contains("Ana Lima").should("be.visible");
    cy.reload();
    cy.contains("Reserva confirmada").should("be.visible");
  });
});
