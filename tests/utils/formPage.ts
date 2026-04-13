import { Page, Locator, expect } from '@playwright/test';

export class FormPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<Locator> {
    return this.page.getByRole('group', { name: groupName }).getByLabel(optionLabel);
  }

  async checkRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<void> {
    const radioButton = await this.getRadioButton(groupName, optionLabel);
    await expect(radioButton).toBeVisible();
    await radioButton.check();
  }

  async uncheckRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<void> {
    const radioButton = await this.getRadioButton(groupName, optionLabel);
    await expect(radioButton).toBeVisible();
    await radioButton.uncheck();
  }

  async getInput(label: string | RegExp): Promise<Locator> {
    return this.page.getByRole('textbox', { name: label }).first();
  }

  async fillInput(label: string | RegExp, value: string): Promise<void> {
    const input = await this.getInput(label);
    await expect(input).toBeVisible();
    await input.fill(value);
  }

  async fillInputLast(label: string | RegExp, value: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: label }).last();
    await expect(input).toBeVisible();
    await input.fill('');
    await input.fill(value);
  }

  async clickButton(buttonText: string, index: number = 0): Promise<void> {
    const buttons = this.page.getByRole('button', { name: buttonText });
    const button = index > 0 ? buttons.nth(index) : buttons.first();
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickByDataCy(value: string): Promise<void> {
    const element = this.page.locator(`[data-cy="${value}"]`).first();
    await expect(element).toBeVisible();
    await element.click();
  }

  async getInputValue(label: string): Promise<string> {
    const input = await this.getInput(label);
    return await input.inputValue();
  }

  async getTextContent(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    return await element.textContent();
  }

  async checkCheckbox(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await expect(checkbox).toBeVisible();
    await checkbox.check();
  }

  async uncheckCheckbox(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await expect(checkbox).toBeVisible();
    await checkbox.uncheck();
  }

  async selectOption(label: string | RegExp, value: string): Promise<void> {
    const select = this.page.getByRole('combobox', { name: label });
    await expect(select).toBeVisible();
    await select.selectOption(value);
  }

  async getSelectedOption(label: string | RegExp): Promise<string> {
    const select = this.page.getByRole('combobox', { name: label });
    await expect(select).toBeVisible();
    return await select.inputValue();
  }

  async getByText(text: string): Promise<Locator> {
    return this.page.locator(`text="${text}"`);
  }

  async assertInputValue(label: string | RegExp, expected: string): Promise<void> {
    const input = await this.getInput(label);
    await expect(input).toHaveValue(expected);
  }

  async assertVisibleText(text: string): Promise<void> {
    const el = this.page.getByText(text, { exact: false });
    await expect(el).toBeVisible();
  }

  async assertVisibleTextAtLeastOnce(text: string): Promise<void> {
    const matches = this.page.getByText(text, { exact: false });

    await expect
      .poll(async () => {
        const count = await matches.count();

        for (let index = 0; index < count; index += 1) {
          if (await matches.nth(index).isVisible()) {
            return true;
          }
        }

        return false;
      })
      .toBe(true);
  }

  async assertInputVisible(label: string | RegExp): Promise<void> {
    const textbox = this.page.getByRole('textbox', { name: label });
    const combobox = this.page.getByRole('combobox', { name: label });
    await expect(textbox.or(combobox).first()).toBeVisible();
  }

  async assertSelectedOption(label: string, expected: string): Promise<void> {
    const select = this.page.getByLabel(label);
    await expect(select).toBeVisible();
    await expect(select).toHaveValue(expected);
  }

  async assertCheckboxChecked(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeChecked();
  }

  async assertNotVisibleText(text: string): Promise<void> {
    const el = this.page.getByText(text, { exact: false });
    await expect(el).not.toBeVisible();
  }
}
