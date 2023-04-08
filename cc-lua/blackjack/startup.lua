url="http://localhost"
monitor = peripheral.find("monitor")
diskDrive = peripheral.find("drive")
term.clear()
term.setCursorPos(1, 1)
bet = 0
isPlaying = false
machineToken = nil

--Checking if we have everything we need
if not fs.exists("apis/json") then
    shell.run("pastebin get 4nRg9CHU apis/json")
    os.reboot()
end


--load apis
os.loadAPI("apis/json")


function startGame()
    print("Game started with bet: ".. bet)
    local data = '{"machineToken": "'..machineToken..'", "id": "'..userToken..'", "bet": '..bet..'}'
    local headers = {["Content-Type"] = "application/json"}
    local response = http.post(url.. "/api/machine/blackjack/start", data, headers)
    if response then
        local body = response.readAll()
        obj = json.decode(body)
        response.close()
        print(body)
        gameID = obj.gameId
        --Checking if all the info matches up
        if obj.machineId == machineToken and obj.gameType == "blackjack" and obj.bet == bet then
            term.setTextColor(colors.green)
            print("All good!")
            term.setTextColor(colors.white)
        else
            print("Info mismatch")
            local data = '{"alert": "Server-Client info mismatch"}'
            local headers = {["Content-Type"] = "application/json"}
            http.post(url.. "/api/alerts", data, headers)
            start()
        end
    else
        errorScreen("Game error")
    end
    print("Game id: ".. gameID)
    print("Game bet: ".. bet)
    monitor.clear()
    local dealerCardString = table.concat(obj.dealerCards, ', ')
    local playerCardString = table.concat(obj.playerCards, ', ')
    drawText("Dealers cards:", 8, 4)
    drawText(dealerCardString, 1 + ((29 - #dealerCardString) / 2), 5, colors.blue)

    drawText("Player cards:", 9, 8)
    drawText(playerCardString, 1 + ((29 - #playerCardString) / 2), 9, colors.blue)
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

function getUserData(user)
    print("Getting user ".. user.. "'s data")
    --Include machineToken value as a query parameter
    local query = "id=".. user.. "&hash=".. machineToken

    local response = http.get(url.. "/api/user/getUser?".. query)
    
    if response then
        local body = response.readAll()
        obj = json.decode(body)
        response.close()
        term.setTextColor(colors.green)
        print("User data GET successful!")
        term.setTextColor(colors.white)
        return obj, body
    else
        diskDrive.ejectDisk()
        print("Failed to get user data! Ejected disk")
        start()
    end
end


function errorScreen(errorText) 
    monitor.setBackgroundColor(colors.blue)
    monitor.clear()
    drawText("An error has occured", 5, 5)
    drawText("This machine has been", 4, 8)
    drawText("automatically disabled", 4, 9)
    drawText("Error: ".. errorText, 1, 19)
    error("Machine had an error: ".. errorText)
end


function setup()
    local input = io.read()
    if input == "y" then
        print("Checking server avalability..\n")
        os.sleep(2)
        local serverStatus = http.get(url.. "/api/getStatus")
        if serverStatus then
            print("Please start pairing on the dashboard!\n")
            print("Main page > Machines > Add Machine\n")
            os.sleep(1)
            print("This machine's type: Blackjack")
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
                local obj = json.decode(body)
                response.close()
                local openFile = fs.open("data/connectionToken", "w")
                openFile.write(obj.data.token)
                openFile.close()
                local openFile = fs.open("data/machineType", "w")
                openFile.write(obj.data.machineType)
                openFile.close()
                term.setTextColor(colors.green)
                print("Server pairing successful!")
                term.setTextColor(colors.white)
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

function retryServer()
    local serverStatus = http.get(url.. "/api/getStatus")
    if serverStatus == nil then
        monitor.setBackgroundColor(colors.gray)
        monitor.clear()
        drawText("Connection error", 7, 8, 16)
        drawText("Server unreachable", 6, 9, 16)
        while true do
            local serverStatus = http.get(url.. "/api/getStatus")
            if serverStatus then
                print("Server reachable!")
                break
            else
                print("Retrying connection in 60 seconds")
                os.sleep(60)
            end
        end
    end
end

--Check if machine is registered to network and attempt registeration if not
if not fs.exists("data/connectionToken") then
    print("Cannot find connection token.")
    print("Would you like to run setup? (y/n)")
    setup()
else
    local file = fs.open("data/connectionToken", "r")
    machineToken = file.readAll()
    file.close()
end


if monitor == nil then
    error("No monitor connected")
end

if diskDrive == nil then
    error("No disk drive connected")
end

function start()
    local openFile = fs.open("data/machineType", "r")
    machineType = openFile.readLine()
    openFile.close()
    redstone.setOutput("front", false)
    isPlaying = false
    diskDrive.ejectDisk()
    monitor.setBackgroundColor(colors.green)
    monitor.clear()
    drawText("BLACKJACK", 10, 6, colors.red)
    drawText("Throw card into hopper", 4, 9)
    drawText("to begin", 11, 11)

    local event, side = os.pullEvent("disk")
    print("Disk inserted.")
    local file = fs.open("disk/casinoData", "r")
    if file == nil then
        diskDrive.ejectDisk()
        print("Casino data not able to be opened.")
        start()
    end
    print("Casino data opened.")
    local fileData = file.readLine()
    file.close()
    print(fileData)
    userToken = string.sub(fileData, 1, string.find(fileData, "%.") - 1)
    userTokenId = string.sub(fileData, string.find(fileData, "%.") + 1)
    print(userToken)
    print(userTokenId)
    monitor.clear()
    redstone.setOutput("front", true)
    isPlaying = true
    drawText("Loading...", 10, 8)
    os.sleep(2)
    monitor.clear()
    userData, unparsedData = getUserData(userTokenId)
    print(unparsedData)
    if userData.isDisabled == true then
        print("User account is disabled.")
        monitor.setBackgroundColor(colors.red)
        monitor.clear()
        drawText("User: ".. string.sub(userData.token, 1, 8), 1, 1, 128)
        drawText("It seems your account", 5, 7)
        drawText("is disabled!", 9, 8)
        drawText("Contact us", 10, 11)
        drawText("to get this resolved", 5, 12)
        os.sleep(2)
        diskDrive.ejectDisk()
        os.sleep(15)
        start()
    elseif userData.isAdmin == true then
        print("User account is admin.")
        monitor.setBackgroundColor(colors.blue)
        drawText(" ADMIN ", 23, 1)
        monitor.setBackgroundColor(colors.green)
    end
    drawText("User: ".. string.sub(userData.token, 1, 8), 1, 1, 128)
    drawText("Balance: $".. userData.balance, 1, 2, 128)
    drawText("Enter a bet amount!", 6, 6)
    monitor.setBackgroundColor(colors.red)
    drawText(" - ", 8, 9) --8 10
    drawText(" + ", 20, 9) --20 22
    drawText(" Bet ", 13, 11) --13 17
    drawText(" Exit ", 24, 19) --24 19
    monitor.setBackgroundColor(colors.green)
    drawText("         ", 11, 9)
    drawText(tostring(bet), 16 - (#tostring(bet) / 2), 9)

    while true do
        local event, monitorID, x, y = os.pullEvent("monitor_touch")
        if (y==9 and x >= 8 and x <= 10) then
            if not (bet <= 0) then
                bet = bet - 10
                if (bet <= 0) then
                    bet = 0
                end
                drawText("         ", 11, 9)
                drawText(tostring(bet), 16 - (#tostring(bet) / 2), 9)
            end
        end
        if (y==9 and x >= 20 and x <= 22) then
            bet = bet + 10
            if (bet >= userData.balance) then
                bet = userData.balance
            end
            drawText("         ", 11, 9)
            drawText(tostring(bet), 16 - (#tostring(bet) / 2), 9)
        end
        if (y==11 and x >= 13 and x <= 17) then
            print("Bet")
            if bet == 0 then
                print("Bet is 0, Cannot start game.")
                drawText("Bet cannot be 0", 8, 14, colors.red)
            else
                startGame()
            end
        end
        if (y==19 and x >= 24 and x <= 29) then
            print("User requested Exit..")
            monitor.clear()
            isPlaying = false
            local data = '{"machineToken": "'..machineToken..'", "id": '..userTokenId..', "machineType": "'..machineType..'", "data": '..json.encode(userData)..'}'
            local headers = {["Content-Type"] = "application/json"}
            local response = http.post(url.. "/api/user/exitGame", data, headers)

            -- if we get a response then print "exit game successful", if not we handle it
            if response then
                print("Exit game successful")
            else
                local data = '{"alert": "Exit game error"}'
                local headers = {["Content-Type"] = "application/json"}
                http.post(url.. "/api/alerts", data, headers)
                term.setTextColor(colors.red)
                print("Saving user data to file..")
                local file = fs.open("data/userData", "w")
                file.write(userData)
                file.close()
                os.sleep(1)
                errorScreen("Connection refused")
                print("Disabling machine..")
                error("Exit game request failed")
            end
            os.sleep(2)
            os.reboot()
            break
        end
        if (userData.isAdmin and y == 1 and x >= 23) then
            print("admin button")
        end
    end
end


start()