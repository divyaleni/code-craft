
from selenium import webdriver
from selenium.webdriver.common.by import By
from pathlib import Path

driver = webdriver.Chrome()
driver.maximize_window()

try:
    # Open local HTML page
    page = (Path(__file__).resolve().parent / "login.html").as_uri()
    driver.get(page)

    # Remove AngularJS hiding attributes for interface testing
    driver.execute_script("""
        document.documentElement.removeAttribute('ng-cloak');
        document.body.removeAttribute('ng-controller');
        document.querySelectorAll('[ng-cloak]').forEach(
            element => element.removeAttribute('ng-cloak')
        );
    """)

    # 1. Interface Testing
    email = driver.find_element(By.ID, "email")
    password = driver.find_element(By.ID, "password")
    button = driver.find_element(
        By.XPATH, "//button[@type='submit']"
    )

    assert email.is_displayed()
    assert password.is_displayed()
    assert button.is_displayed()

    print("Interface test passed")

    # 2. Empty Field Validation
    assert email.get_attribute("required") is not None
    assert password.get_attribute("required") is not None

    print("Empty field validation test passed")

    # 3. Check Empty Form
    button.click()

    print("Empty form test executed")

    # 4. Enter Sample Details
    email.send_keys("student@example.com")
    password.send_keys("Student123")

    assert email.get_attribute("value") == "student@example.com"
    assert password.get_attribute("value") == "Student123"

    print("Input field test passed")
    print("All interface test cases passed")

finally:
    driver.quit()
