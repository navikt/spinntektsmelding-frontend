// pageObject.js
import { Page, Locator } from '@playwright/test';

export class FormPage {
  // Store page reference for locator
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Custom locator for radio button within a group
  async getRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<Locator> {
    // Find the radio group by its name and return the specific radio button by its label
    // return this.page.locator(`role=group[name="${groupName}"] input[type="radio"][value="${optionLabel}"]`);
    return this.page.getByRole('group', { name: groupName }).getByLabel(optionLabel);
  }

  // Example of a method to check a radio button
  async checkRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<void> {
    const radioButton = await this.getRadioButton(groupName, optionLabel);
    return radioButton.check();
  }

  // Example of a method to uncheck a radio button
  async uncheckRadioButton(groupName: string | RegExp, optionLabel: string | RegExp): Promise<void> {
    const radioButton = await this.getRadioButton(groupName, optionLabel);
    await radioButton.uncheck();
  }

  async getInput(label: string): Promise<Locator> {
    return this.page.getByRole('textbox', { name: label });
  }

  async fillInput(label: string, value: string): Promise<void> {
    const inputField = await this.getInput(label);
    await inputField.fill(value);
  }
  async clickButton(buttonText: string): Promise<void> {
    const button = this.page.getByRole('button', { name: buttonText });
    await button.click();
  }
  async getInputValue(label: string): Promise<string> {
    const inputField = this.page.getByLabel(label);
    return await inputField.inputValue();
  }
  async getTextContent(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    return await element.textContent();
  }
  async checkCheckbox(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await checkbox.check();
  }
  async uncheckCheckbox(label: string): Promise<void> {
    const checkbox = this.page.getByLabel(label);
    await checkbox.uncheck();
  }
  async selectOption(label: string, value: string): Promise<void> {
    const select = this.page.getByLabel(label);
    await select.selectOption(value);
  }
  async getSelectedOption(label: string): Promise<string> {
    const select = this.page.getByLabel(label);
    const selectedOption = await select.inputValue();
    return selectedOption;
  }
  async getByText(text: string): Promise<Locator> {
    return this.page.locator('text="' + text + '"');
  }
}
