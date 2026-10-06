import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`finance layouts fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const story of ["wealth", "transactions"]) {
      await page.goto(
        `/iframe.html?id=finance-dashboard--${story}&viewMode=story&globals=theme:calm-dark`,
      );
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("region", { name: "Resumo financeiro" })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow).toBe(false);
      const title = await page.getByRole("heading", { level: 1 }).boundingBox();
      const action = await page
        .getByRole("button", {
          name: story === "wealth" ? "Cadastrar investimento" : "Nova transação",
          exact: true,
        })
        .boundingBox();
      expect(title).not.toBeNull();
      expect(action).not.toBeNull();
      expect(title!.x + title!.width <= action!.x || title!.y + title!.height <= action!.y).toBe(
        true,
      );
    }
  });
}

test("long header actions wrap without overlap at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/iframe.html?id=layout-pageheader--narrow-finance-actions&viewMode=story");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  const title = await heading.boundingBox();
  const action = await page.getByRole("button", { name: "Nova transação" }).boundingBox();
  expect(action!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("transaction filters support keyboard submit and clearing", async ({ page }) => {
  await page.goto("/iframe.html?id=finance-dashboard--transactions&viewMode=story");
  const query = page.getByRole("searchbox", { name: "Buscar descrição" });
  await query.fill("Mercado");
  await query.press("Enter");
  await expect(page.getByRole("cell", { name: "Mercado · exemplo", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Salário · exemplo", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.getByRole("cell", { name: "Salário · exemplo", exact: true })).toBeVisible();
  await expect(query).toHaveValue("");
});

test("finance patterns render in calm light theme", async ({ page }) => {
  await page.goto("/iframe.html?id=finance-dashboard--wealth&viewMode=story&globals=theme:calm");
  await expect(page.getByRole("region", { name: "Distribuição por classe" })).toBeVisible();
  await expect(page.getByText("-25%", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("cash flow colors and negative balance warning follow simulated outflows", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=finance-dashboard--transactions&viewMode=story&globals=theme:calm-dark",
  );
  await expect(page.getByRole("article", { name: "Entradas do período" })).toContainText(
    "R$ 8.000,00",
  );
  const income = page.getByRole("cell", { name: "+R$ 8.000,00", exact: true }).locator("span");
  const expense = page.getByRole("cell", { name: "−R$ 320,00", exact: true }).locator("span");
  expect(await income.evaluate((el) => getComputedStyle(el).color)).not.toEqual(
    await expense.evaluate((el) => getComputedStyle(el).color),
  );
  const simulate = page.getByRole("button", { name: "Simular saída", exact: true });
  const balance = page.getByRole("article", { name: "Saldo do período" });
  await simulate.click();
  await expect(balance).toContainText("R$ 2.680,00");
  await simulate.click();
  await expect(balance).toContainText("R$ 0,00");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText("Saldo zerado", { exact: true })).toBeVisible();
  await simulate.click();
  await expect(balance).toContainText("−R$ 320,00");
  await expect(page.getByRole("alert")).toContainText("Saldo no vermelho");
  await expect(simulate).toBeDisabled();
  await page.getByRole("button", { name: "Reiniciar demonstração" }).click();
  await expect(balance).toContainText("R$ 5.680,00");
  await expect(page.getByRole("alert")).toHaveCount(0);
});
