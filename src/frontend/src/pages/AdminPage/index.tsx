import { cloneDeep } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import PaginatorComponent from "../../components/PaginatorComponent";
import ShadTooltip from "../../components/ShadTooltipComponent";
import IconComponent from "../../components/genericIconComponent";
import Header from "../../components/headerComponent";
import LoadingComponent from "../../components/loadingComponent";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  ADMIN_HEADER_DESCRIPTION,
  ADMIN_HEADER_TITLE,
} from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { AuthContext } from "../../contexts/authContext";
import { TabsContext } from "../../contexts/tabsContext";
import {
  addUser,
  deleteUser,
  getUsersPage,
  updateUser,
} from "../../controllers/API";
import ConfirmationModal from "../../modals/ConfirmationModal";
import UserManagementModal from "../../modals/UserManagementModal";
import { Users } from "../../types/api";
import { UserInputType } from "../../types/components";

export default function AdminPage() {
  const [inputValue, setInputValue] = useState("");

  const [size, setPageSize] = useState(10);
  const [index, setPageIndex] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { userData } = useContext(AuthContext);
  const [totalRowsCount, setTotalRowsCount] = useState(0);

  const { setTabId } = useContext(TabsContext);

  // set null id
  useEffect(() => {
    setTabId("");
  }, []);

  const userList = useRef([]);

  useEffect(() => {
    setTimeout(() => {
      getUsers();
    }, 500);
  }, []);

  const [filterUserList, setFilterUserList] = useState(userList.current);

  function getUsers() {
    setLoadingUsers(true);
    getUsersPage(index - 1, size)
      .then((users) => {
        setTotalRowsCount(users["total_count"]);
        userList.current = users["users"];
        setFilterUserList(users["users"]);
        setLoadingUsers(false);
      })
      .catch((error) => {
        setLoadingUsers(false);
      });
  }

  function handleChangePagination(pageIndex: number, pageSize: number) {
    setLoadingUsers(true);
    setPageSize(pageSize);
    setPageIndex(pageIndex);
    getUsersPage(pageSize * (pageIndex - 1), pageSize)
      .then((users) => {
        setTotalRowsCount(users["total_count"]);
        userList.current = users["users"];
        setFilterUserList(users["users"]);
        setLoadingUsers(false);
      })
      .catch((error) => {
        setLoadingUsers(false);
      });
  }

  function resetFilter() {
    setPageIndex(1);
    setPageSize(10);
    getUsers();
  }

  function handleFilterUsers(input: string) {
    setInputValue(input);

    if (input === "") {
      setFilterUserList(userList.current);
    } else {
      const filteredList = userList.current.filter((user: Users) =>
        user.username.toLowerCase().includes(input.toLowerCase())
      );
      setFilterUserList(filteredList);
    }
  }

  function handleDeleteUser(user) {
    deleteUser(user.id)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: "Success! User deleted!",
        });
      })
      .catch((error) => {
        setErrorData({
          title: "Error on delete user",
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleEditUser(userId, user) {
    updateUser(userId, user)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: "Success! User edited!",
        });
      })
      .catch((error) => {
        setErrorData({
          title: "Error on edit user",
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleDisableUser(check, userId, user) {
    const userEdit = cloneDeep(user);
    userEdit.is_active = !check;

    updateUser(userId, userEdit)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: "Success! User edited!",
        });
      })
      .catch((error) => {
        setErrorData({
          title: "Error on edit user",
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleSuperUserEdit(check, userId, user) {
    const userEdit = cloneDeep(user);
    userEdit.is_superuser = !check;
    updateUser(userId, userEdit)
      .then((res) => {
        resetFilter();
        setSuccessData({
          title: "Success! User edited!",
        });
      })
      .catch((error) => {
        setErrorData({
          title: "Error on edit user",
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function handleNewUser(user: UserInputType) {
    addUser(user)
      .then((res) => {
        updateUser(res["id"], {
          is_active: user.is_active,
          is_superuser: user.is_superuser,
        }).then((res) => {
          resetFilter();
          setSuccessData({
            title: "Success! New user added!",
          });
        });
      })
      .catch((error) => {
        setErrorData({
          title: "Error when adding new user",
          list: [error.response.data.detail],
        });
      });
  }

  return (
    <>
      {userData && (
        <div className="admin-page-panel flex h-full flex-col pb-8">
          <div className="main-page-nav-arrangement">
            <span className="main-page-nav-title">
              <IconComponent name="Shield" className="w-6" />
              {ADMIN_HEADER_TITLE}
            </span>
          </div>
          <span className="admin-page-description-text mx-5">
            {ADMIN_HEADER_DESCRIPTION}
          </span>
          <div className="flex w-full justify-between px-4">
            <div className="flex w-96 items-center gap-4">
              <Input
                placeholder="搜索用户名"
                value={inputValue}
                onChange={(e) => handleFilterUsers(e.target.value)}
              />
              {inputValue.length > 0 ? (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setInputValue("");
                    setFilterUserList(userList.current);
                  }}
                >
                  <IconComponent name="X" className="w-6 text-foreground" />
                </div>
              ) : (
                <div>
                  <IconComponent
                    name="Search"
                    className="w-6 text-foreground"
                  />
                </div>
              )}
            </div>
            <div>
              <UserManagementModal
                title="新建用户"
                titleHeader={"创建一个新用户"}
                cancelText="取消"
                confirmationText="保存"
                icon={"UserPlus2"}
                onConfirm={(index, user) => {
                  handleNewUser(user);
                }}
                asChild
              >
                <Button variant="primary">新用户</Button>
              </UserManagementModal>
            </div>
          </div>
          {loadingUsers ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoadingComponent remSize={12} />
            </div>
          ) : userList.current.length === 0 ? (
            <>
              <div className="m-4 flex items-center justify-between text-sm">
                没有新的用户注册.
              </div>
            </>
          ) : (
            <>
              <div
                className={
                  "m-4 h-full overflow-x-hidden overflow-y-scroll rounded-md border-2 bg-background custom-scroll" +
                  (loadingUsers ? " border-0" : "")
                }
              >
                <Table className={"table-fixed outline-1 "}>
                  <TableHeader
                    className={
                      loadingUsers ? "hidden" : "table-fixed bg-muted outline-1"
                    }
                  >
                    <TableRow>
                      {/* <TableHead className="h-10">Id</TableHead> */}
                      <TableHead className="h-10">用户名</TableHead>
                      <TableHead className="h-10">是否可用</TableHead>
                      <TableHead className="h-10">是否超级用户</TableHead>
                      <TableHead className="h-10">创建时间</TableHead>
                      <TableHead className="h-10">更新时间</TableHead>
                      <TableHead className="h-10 w-[100px]  text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  {!loadingUsers && (
                    <TableBody>
                      {filterUserList.map((user: UserInputType, index) => (
                        <TableRow key={index}>
                          {/* <TableCell className="truncate py-2 font-medium">
                            <ShadTooltip content={user.id}>
                              <span className="cursor-default">{user.id}</span>
                            </ShadTooltip>
                          </TableCell> */}
                          <TableCell className="truncate py-2">
                            <ShadTooltip content={user.username}>
                              <span className="cursor-default">
                                {user.username}
                              </span>
                            </ShadTooltip>
                          </TableCell>
                          <TableCell className="relative left-1 truncate py-2 text-align-last-left">
                            <ConfirmationModal
                              asChild
                              title="Edit"
                              titleHeader={`${user.username}`}
                              modalContentTitle="Attention!"
                              modalContent="Are you completely confident about the changes you are making to this user?"
                              cancelText="Cancel"
                              confirmationText="Confirm"
                              icon={"UserCog2"}
                              data={user}
                              index={index}
                              onConfirm={(index, user) => {
                                handleDisableUser(
                                  user.is_active,
                                  user.id,
                                  user
                                );
                              }}
                            >
                              <div className="flex w-fit">
                                <Checkbox
                                  id="is_active"
                                  checked={user.is_active}
                                />
                              </div>
                            </ConfirmationModal>
                          </TableCell>
                          <TableCell className="relative left-1 truncate py-2 text-align-last-left">
                            <ConfirmationModal
                              asChild
                              title="Edit"
                              titleHeader={`${user.username}`}
                              modalContentTitle="Attention!"
                              modalContent="Are you completely confident about the changes you are making to this user?"
                              cancelText="Cancel"
                              confirmationText="Confirm"
                              icon={"UserCog2"}
                              data={user}
                              index={index}
                              onConfirm={(index, user) => {
                                handleSuperUserEdit(
                                  user.is_superuser,
                                  user.id,
                                  user
                                );
                              }}
                            >
                              <div className="flex w-fit">
                                <Checkbox
                                  id="is_superuser"
                                  checked={user.is_superuser}
                                />
                              </div>
                            </ConfirmationModal>
                          </TableCell>
                          <TableCell className="truncate py-2 ">
                            {
                              new Date(user.create_at!)
                                .toISOString()
                                .split("T")[0]
                            }
                          </TableCell>
                          <TableCell className="truncate py-2">
                            {
                              new Date(user.update_at!)
                                .toISOString()
                                .split("T")[0]
                            }
                          </TableCell>
                          <TableCell className="flex w-[100px] py-2 text-right">
                            <div className="flex">
                              <UserManagementModal
                                title="编辑"
                                titleHeader={`${user.id}`}
                                cancelText="取消"
                                confirmationText="保存"
                                icon={"UserPlus2"}
                                data={user}
                                index={index}
                                onConfirm={(index, editUser) => {
                                  handleEditUser(user.id, editUser);
                                }}
                              >
                                <ShadTooltip content="编辑" side="top">
                                  <IconComponent
                                    name="Pencil"
                                    className="h-4 w-4 cursor-pointer"
                                  />
                                </ShadTooltip>
                              </UserManagementModal>

                              <ConfirmationModal
                                title="删除"
                                titleHeader="删除用户"
                                modalContentTitle="注意!"
                                modalContent="您确定要删除用户账号吗？这一步是不可恢复的."
                                cancelText="取消"
                                confirmationText="删除"
                                icon={"UserMinus2"}
                                data={user}
                                index={index}
                                onConfirm={(index, user) => {
                                  handleDeleteUser(user);
                                }}
                              >
                                <ShadTooltip content="删除" side="top">
                                  <IconComponent
                                    name="Trash2"
                                    className="ml-2 h-4 w-4 cursor-pointer"
                                  />
                                </ShadTooltip>
                              </ConfirmationModal>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </div>

              <PaginatorComponent
                pageIndex={index}
                pageSize={size}
                totalRowsCount={totalRowsCount}
                paginate={(pageSize, pageIndex) => {
                  handleChangePagination(pageIndex, pageSize);
                }}
              ></PaginatorComponent>
            </>
          )}
        </div>
      )}
    </>
  );
}
