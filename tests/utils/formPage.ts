import { Page, Locator, expect } from '@playwright/test';

export class FormPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Radio buttons
  async getRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<Locator> {
    return this.page.getByRole('group', { name: groupName }).getByLabel(optionLabel);
  }

  async checkRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<void> {
    const radioButton = await this.getRadioButton(groupName, optionLabel);
    await radioButton.check();
  }

  async uncheckRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<void> {
    const radioButton = await this.getRadioButton(groupName, optionLabel);
    await radioButton.uncheck();
  }

  // Input fields
  async getInput(label: string): Promise<Locator> {
    return this.page.getByRole('textbox', { name: label });
  }

  async fillInput(label: string, value: string): Promise<void> {
    const input = await this.getInput(label);
    await input.fill(value);
    await input.blur();
  }

  async fillInputLast(label: string, value: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: label }).last();
    await input.fill(value);
  }

  // Buttons
  async clickButton(buttonText: string, index: number = 0): Promise<void> {
    const buttons = this.page.getByRole('button', { name: buttonText });
    const button = index > 0 ? buttons.nth(index) : buttons.first();
    await button.click();
  }

  async clickButtonAndWaitFor(buttonText: string, waitForText: string, index: number = 0): Promise<void> {
    await this.clickButton(buttonText, index);
    await this.page.waitForSelector(`text=${waitForText}`);
  }

  // Input values
  async getInputValue(label: string): Promise<string> {
    const input = await this.getInput(label);
    return await input.inputValue();
  }

  async getTextContent(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    return await element.textContent();
  }

  // Checkboxes
  async checkCheckbox(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await checkbox.check();
  }

  async uncheckCheckbox(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await checkbox.uncheck();
  }

  // Select/Combobox
  async selectOption(label: string, value: string): Promise<void> {
    const select = this.page.getByRole('combobox', { name: label });
    await select.selectOption(value);
  }

  async getSelectedOption(label: string): Promise<string> {
    const select = this.page.getByRole('combobox', { name: label });
    return await select.inputValue();
  }

  // Locators
  async getByText(text: string): Promise<Locator> {
    return this.page.locator(`text="${text}"`);
  }

  // Assertions
  async assertInputValue(label: string, expected: string): Promise<void> {
    const input = await this.getInput(label);
    await expect(input).toHaveValue(expected);
  }

  async assertVisibleText(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: false })).toBeVisible();
  }

  async assertVisibleTextAtLeastOnce(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible();
  }

  async assertSelectedOption(label: string, expected: string): Promise<void> {
    const select = this.page.getByLabel(label);
    await expect(select).toHaveValue(expected);
  }

  async assertCheckboxChecked(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await expect(checkbox).toBeChecked();
  }

  async assertCheckboxNotChecked(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await expect(checkbox).not.toBeChecked();
  }

  async assertNotVisibleText(text: string): Promise<void> {
    await expect(this.page.getByText(text, { exact: false })).not.toBeVisible();
  }

  // Navigation og venting
  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<Locator> {
    return this.page.waitForSelector(selector, options);
  }

  async waitForText(text: string): Promise<void> {
    await this.page.waitForSelector(`text=${text}`);
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // Screenshot utilities
  async screenshot(name: string, options?: { fullPage?: boolean }): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: options?.fullPage ?? true
    });
  }

  async screenshotElement(selector: string, name: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.screenshot({ path: `screenshots/${name}.png` });
  }
}
