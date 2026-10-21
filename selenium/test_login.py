from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from pathlib import Path

driver = webdriver.Chrome()
driver.maximize_window()

try:
    page = (Path(__file__).resolve().parent / "login.html").as_uri()
    driver.get(page)

    assert driver.find_element(By.ID, "loginType").is_displayed()
    assert driver.find_element(By.ID, "loginEmail").is_displayed()
    assert driver.find_element(By.ID, "loginPassword").is_displayed()
    assert driver.find_element(By.ID, "loginSubmitBtn").is_displayed()
    print("Interface test passed")

    email = driver.find_element(By.ID, "loginEmail")
    password = driver.find_element(By.ID, "loginPassword")
    button = driver.find_element(By.ID, "loginSubmitBtn")

    email.clear()
    password.clear()
    button.click()

    alert = driver.switch_to.alert
    message = alert.text
    alert.accept()

    assert message == "Please enter your email address."
    print("Empty-field functional test passed")

    email.send_keys("invalid@example.com")
    password.send_keys("wrongpassword")
    button.click()

    alert = driver.switch_to.alert
    message = alert.text
    alert.accept()

    assert message == "Invalid username or password"
    print("Invalid login test passed")

    select = Select(driver.find_element(By.ID, "loginType"))
    select.select_by_value("volunteer")

    assert driver.find_element(
        By.ID, "volunteerStatusField"
    ).is_displayed()

    print("Usability test passed")
    driver.find_element(By.ID, "loginType").click()
    select.select_by_value("donor")

    email.clear()
    password.clear()
    email.send_keys("test@example.com")
    password.send_keys("Test123")
    button.click()

    alert = driver.switch_to.alert
    message = alert.text
    alert.accept()

    assert message == "Login successful"
    print("Valid login test passed")

    print("All test cases passed")

finally:
    driver.quit()
