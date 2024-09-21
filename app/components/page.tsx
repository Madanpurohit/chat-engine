"use client";
import { createConfig, http } from "@wagmi/core";
import { useWatchContractEvent, usePublicClient} from 'wagmi'
import { sepolia } from "@wagmi/core/chains";
import React, { useState, useRef, useEffect } from "react";
import { encodeFunctionData } from "viem";
import { abi } from "../abi/Chatter.json";
import { useLogout, useSendUserOperation, useSmartAccountClient } from "@account-kit/react";
import JazziconImage from "./JazzIcon";

interface Message {
  id: number;
  text: string;
  sender: string;
}

interface User {
  id: number;
  name: string;
  status: "online" | "offline";
}


export default function  DesktopGroupChatTailwind() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [input, setInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const config = createConfig({
    chains: [sepolia],
    transports: {
      [sepolia.id]: http(),
    },
  })
  const publicClient = usePublicClient({config})
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const { logout, isLoggingOut, error } = useLogout({});
  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    // optional parameter that will wait for the transaction to be mined before returning
    waitForTxn: true,
    onSuccess: ({ hash, request }) => {
      // [optional] Do something with the hash and request
      setIsSendingMessage(false);
      console.log(hash,request)
    },
    onError: (error) => {
      console.log(error)
      setIsSendingMessage(false);
      // [optional] Do something with the error
    },
  });
  const _data = encodeFunctionData({
    abi,
    functionName: "sendMessage",
    args: [input]
  })
  function sendMessage(){
    sendUserOperation({
      uo: {
        target: "0x63707323a76d952a6d09886e4c4f3e25d4bd0bab",
        data: _data,
      },
    });
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    publicClient.getBlockNumber()
    .then((blockNumber:any)=>{
      publicClient.getContractEvents({
        address: '0x63707323a76d952a6d09886e4c4f3e25d4bd0bab',
        abi,
        eventName: 'Chatter__SendMessage',
        fromBlock: blockNumber - BigInt(20000),
        toBlock: 'latest'
      }).then((messages)=>{
        let initialMessages: Message[] = [];
        let initialUser: User[] = [];
        let uniqueUser:Set<String> = new Set();
        let id:number = 0;
        let idUser:number= 0;
        messages.forEach((ele:any)=>{
          const newMessage: Message = {
            id: id + 1,
            text: ele?.args?.message,
            sender: ele?.args?.sender,
          };
          if(!uniqueUser.has(ele?.args?.sender)){
            const newUser: User = {
              id: idUser+1,
              name: ele?.args?.sender,
              status: "online"
            }
            uniqueUser.add(ele?.args?.sender);
            initialUser.push(newUser);
            idUser = idUser+1;
          }
          id=id+1;
          initialMessages.push(newMessage);
        });
        console.log(initialMessages);
        setMessages(initialMessages);
        setUsers(Array.from(initialUser));
      })
    })
  }, []);
  useWatchContractEvent({
    address: '0x63707323a76d952a6d09886e4c4f3e25d4bd0bab',
    abi,
    config,
    eventName: 'Chatter__SendMessage',
    onLogs(logs:any) {
      const newMessage: Message = {
        id: messages.length+1,
        text: logs[0]?.args?.message,
        sender: logs[0]?.args?.sender,
      };
      setMessages([...messages,newMessage]);
    },
    onError(err) {
      console.log('New Error!',err)
    }
  })
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && client?.account) {
      setIsSendingMessage(true);
      sendMessage();
      setInput("");
    }
  };

  const handleLogOut = (e:any) =>{
    e.preventDefault();
    logout();
  }

  return (
    <div className="flex h-screen font-sans text-gray-800">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          {client?.account ? (
            <>
              <div className="font-bold mb-1">Your Ethereum Address:</div>
              <div className="text-xs break-all mb-2">{client.account.address}</div>
              <button className="bg-green-500 text-white py-2 px-6 rounded-full" onClick={handleLogOut}>Log out</button>
            </>
          ) : <></>}
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-semibold mb-4">Group Members</h3>
          {users.map((user) => (
            <div key={user.id} className="flex items-center mb-4">
              <div className="relative mr-3">
                <JazziconImage address={user.name}/>
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                    user.status === "online" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold">Crypto Chat Group</h2>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === client?.account?.address ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex ${
                  message.sender === client?.account?.address ? "flex-row-reverse" : "flex-row"
                } items-end`}
              >
                
                <JazziconImage address={message.sender}/>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === client?.account?.address ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <form
          onSubmit={(e)=>handleSend(e)}
          className="p-4 border-t border-gray-200 flex"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={client?.account ? "Type your message..." : "Login to chat"}
            disabled={isSendingMessage}
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 mr-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isSendingMessage}
            className={`bg-green-500 text-white py-2 px-6 rounded-full ${
              client?.account
                ? "hover:bg-green-600"
                : "opacity-50 cursor-not-allowed"
            } transition duration-200`}
          >
            {isSendingMessage? "Sending" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
