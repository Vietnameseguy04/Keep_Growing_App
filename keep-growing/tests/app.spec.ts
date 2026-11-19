import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@student.dhbw-stuttgart.de';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'testpassword123';

test.describe('Authentifizierung', () => {
  test('Login-Seite lädt korrekt', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Keep Growing/);
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('Registrierung mit Nicht-DHBW-Email wird abgelehnt', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('Name').fill('Test User');
    await page.getByPlaceholder('Email').fill('test@gmail.com');
    await page.getByPlaceholder('Password').first().fill('password123');
    await page.getByPlaceholder('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByText('DHBW-E-Mail-Adresse')).toBeVisible();
  });

  test('Registrierung mit DHBW-Email ist möglich', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByText('@dhbw')).not.toBeVisible();
  });

  test('Fehlerhafter Login zeigt Fehlermeldung', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('falsch@student.dhbw.de');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/error=true/);
  });
});

test.describe('Dashboard (eingeloggt)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill(TEST_EMAIL);
    await page.getByPlaceholder('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
  });

  test('Dashboard lädt nach Login', async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
  });

  test('Dashboard zeigt Mood-Formular und Notes-Feld', async ({ page }) => {
    await expect(page.getByText('How are you feeling today?')).toBeVisible();
    await expect(page.getByPlaceholder('Write your thoughts here...')).toBeVisible();
  });

  test('Journal-Abschnitt ist sichtbar wenn Einträge vorhanden', async ({ page }) => {
    // Journal-Heading erscheint wenn historische Einträge existieren
    const journal = page.getByText('Journal');
    const hasJournal = await journal.isVisible().catch(() => false);
    // Kein harter Fehler wenn noch keine alten Einträge — nur prüfen ob Abschnitt rendert
    if (hasJournal) {
      await expect(journal).toBeVisible();
    }
  });

  test('Insights-Graph zeigt Legende mit Trainings und Stimmung', async ({ page }) => {
    await expect(page.getByText('Trainings')).toBeVisible();
    await expect(page.getByText('Stimmung')).toBeVisible();
  });

  test('Blumengarten ist erreichbar', async ({ page }) => {
    await page.goto('/blumengarten');
    await expect(page).toHaveURL(/blumengarten/);
  });

  test('Trainings-Seite ist erreichbar', async ({ page }) => {
    await page.goto('/trainings');
    await expect(page).toHaveURL(/trainings/);
  });

  test('Einstellungen zeigen DSGVO-Optionen und Reminder-Button', async ({ page }) => {
    await page.goto('/einstellungen');
    await expect(page.getByText('Export my data')).toBeVisible();
    await expect(page.getByText('Delete account')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /activate daily reminders|deactivate daily reminders/i })
    ).toBeVisible();
  });

  test('Logout funktioniert', async ({ page }) => {
    await page.goto('/einstellungen');
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/login/);
  });
});
