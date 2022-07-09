function start()
    print("Welcome to the Casino program installer")
    os.sleep(0.1)
    print("Please pick a program to install onto this computer")
    os.sleep(0.1)
    print("1 - Card Maker")
    os.sleep(0.1)
    print("2 - Card Locker")
    input = read()
    if input == "1" then
        print("Downloading the Card Maker.")
        os.sleep(1)
        shell.run("pastebin get http://pastebin.com/WRTfH0yx encryptApi")
        shell.run("wget https://raw.githubusercontent.com/kennu290/Computercraft-Casino_V2/main/Card%20maker.lua startup.lua")
        os.sleep(1)
        os.reboot()
    elseif input == "2" then
        print("Downloading the Card Locker.")
        os.sleep(1)
        shell.run("wget https://raw.githubusercontent.com/kennu290/Computercraft-Casino_V2/main/Locker.lua startup.lua")
        os.sleep(1)
        os.reboot()
    else
        print("Invalid option. Please retry")
        start()
    end
end

start()
