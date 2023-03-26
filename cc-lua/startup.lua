url="http://localhost"
monitor = peripheral.find("monitor")
diskDrive = peripheral.find("drive")
term.clear()
term.setCursorPos(1, 1)

--Checking if we have everything we need
if not fs.exists("apis/json") then
    shell.run("pastebin get 4nRg9CHU apis/json")
    os.reboot()
end

--load json api
os.loadAPI("apis/json")

function setup()
    local input = io.read()
    if input == "y" then
        print("Checking server avalability..\n")
        os.sleep(2)
        serverStatus = http.checkURL(url)
        if serverStatus == true then
            print("Please start pairing on the dashboard!\n")
            print("Main page > Machines > Add Machine\n")
            os.sleep(1)
            print("This machine's type: Game")
            print("Press enter to continue\n")
            io.read()
            print("Attempting to pair to server")
            os.sleep(2)
            local data = "{}"
            local headers = {["Content-Type"] = "application/json"}

            local response = http.post(url.. "/api/machine/create", data, headers)
                
            --if we get a response then save token to variable, if not we print "failed to make post request"
            if response then
                local body = response.readAll()
                obj = json.decode(body)
                response.close()
                openFile = fs.open("connectionToken", "w")
                openFile.write(obj.data)
                openFile.close()
                print("Server pairing successful!")
                print("Rebooting computer..")
                os.sleep(3)
                os.reboot()
            else
                local data = '{"alert": "Machine creation error"}'
                local headers = {["Content-Type"] = "application/json"}
                http.post(url.. "/api/alerts", data, headers)
                error("Pairing failed! please try again!")
            end
        else
            error("Server unreachable! please verify the URL.")
        end
    elseif input == "n" then
        error("Setup denied by user.")
    else
        print("input not recognized (y/n)")
        setup()
    end
end

--Check if machine is registered to network and attempt registeration if not
if not fs.exists("connectionToken") then
    print("Cannot find connection token.")
    print("Would you like to run setup? (y/n)")
    setup()
end


if monitor == nil then
    error("No monitor connected")
end

if diskDrive == nil then
    error("No disk drive connected")
end

function drawText(input, x, y, color)
    if color == nil then
        monitor.setTextColor(colors.white)
    else
        monitor.setTextColor(color)
    end
    monitor.setCursorPos(x, y)
    monitor.write(input)
end

function start()
    monitor.setBackgroundColor(colors.green)
    monitor.clear()
    drawText("BLACKJACK", 11, 6, 16384)
    drawText("Throw card into hopper", 4, 9)
    drawText("to begin", 11, 11)
    print("Start menu.")

    local event, side = os.pullEvent("disk")
    print("Disk inserted.")
    local file = fs.open("disk/casinoData", "r")
    if file == nil then
        diskDrive.ejectDisk()
        print("Casino data not able to be opened.")
        start()
    end
    print("Casino data opened.")
    local data = file.readLine()
    file.close()
    print(data)
    monitor.clear()
    drawText("Loading...", 10, 8)
    os.sleep(2)
    monitor.clear()
    drawText("User: ".. string.sub(data, 1, 8), 1, 1, 128)
end


start()


