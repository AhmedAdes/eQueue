CREATE DATABASE eQueueing COLLATE Arabic_CI_AI_KS
GO
USE eQueueing
GO

CREATE TABLE Company
(
	CompID INT IDENTITY(1,1) NOT NULL,
	CompName NVARCHAR(300),
	Country NVARCHAR(100),
	City NVARCHAR(100),
	Logo VARBINARY(max),
	CompType NVARCHAR(50),--Provider , Consumer 
	CompAddress NVARCHAR(max),
	Phone NVARCHAR(50),
	Mobile NVARCHAR(50),
	Website NVARCHAR(50),
	Email NVARCHAR(200), 
	Fax NVARCHAR(200), 
	--Notes NVARCHAR(max),
	[Description] NVARCHAR(max),
	WorkField NVARCHAR(100), -- Shipping , FrightForwarding , etc..
	DefaultLanguage NVARCHAR(20),
	[Disabled] BIT DEFAULT 0,	-- for ADMIN Use Only
	MaxPend INT,
	CONSTRAINT PK_Company PRIMARY KEY CLUSTERED (CompID)
)
CREATE TABLE Branch
(
	BranchID INT IDENTITY(1,1) NOT NULL,
	CompID INT,
	BranchName NVARCHAR(300),
	Country NVARCHAR(100),
	City NVARCHAR(100),
	BranchAddress NVARCHAR(max),
	Phone NVARCHAR(50),
	Mobile NVARCHAR(50),
	Email NVARCHAR(200), 
	Fax NVARCHAR(200), 
	[Disabled] BIT DEFAULT 0, -- For CompanyAdmin Use
	CONSTRAINT PK_Branch PRIMARY KEY CLUSTERED (BranchID)
)
CREATE TABLE CompDept
(
	DeptID INT IDENTITY(1,1) NOT NULL,
	CompID INT,
	DeptName NVARCHAR(300),
	RangeFrom INT,
	RangeTo INT,
	Letter NCHAR(1),
	[Disabled] BIT DEFAULT 0, -- For CompanyAdmin Use	
	CONSTRAINT PK_CompDept PRIMARY KEY CLUSTERED (DeptID)
)
CREATE TABLE BranchDepts
(
	BranchID INT, 
	DeptID INT,
	CONSTRAINT PK_BranchDepts PRIMARY KEY (BranchID, DeptID)
)
CREATE TABLE DeptServices
(
	ServID INT IDENTITY(1,1) NOT NULL,
	DeptID INT,
	ServName NVARCHAR(300),
	ServTime INT, -- in Minutes
	[Disabled] BIT DEFAULT 0, -- For CompanyAdmin Use	
	CONSTRAINT PK_DeptServices PRIMARY KEY CLUSTERED (ServID)
)
CREATE TABLE Users 
( --for each provider company there is a default reception ticketing user
	UserID INT IDENTITY(1,1) NOT NULL,
	CompID INT,
	UserName NVARCHAR(200),
	hashPass BINARY(64),
	UserRole NVARCHAR(50), --(Admin//Anonymous//CompanyAdmin//SuperUser//User)
	EntityType TINYINT, --( Company // Consumer)
	ManagerID INT, -- (Self Reference)
	CreateDate DATETIME2,
	Phone NVARCHAR(50),
	Mobile NVARCHAR(50),
	Email NVARCHAR(200) NOT NULL UNIQUE, 
	AccessFailedCount INT DEFAULT 0, --for stopping the login process 
	Title NVARCHAR(200), --Job Title
	BranchID INT,
	Window INT,
	Salt UNIQUEIDENTIFIER ,
	[Disabled] BIT DEFAULT 0, -- For CompanyAdmin Use	
	CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserID)
)
GO
CREATE TABLE UserDepts
(
	UserID INT,
	DeptID INT,
	CONSTRAINT PK_UserDepts PRIMARY KEY CLUSTERED (UserID, DeptID)
)
GO
CREATE TABLE MainQueue
(
	QID INT IDENTITY(1,1) NOT NULL,
	UserID INT, -- The Customer who issued the Ticket
	BranchID INT,
	DeptID INT,
	QLetter NCHAR(1),
	QNumber VarChar(4),
	ServiceNo AS CAST(QNumber AS NCHAR(4)) +'-'+ QLetter PERSISTED,
	RequestDate DATETIME2,
	VisitDate DATE,
	VisitTime TIME, --(Approx.) updated based on cancelation of previous records
	StartServeDT DATETIME2,
	QStatus NVARCHAR(20), -- (Served // Hold // Pending // Not-Attended // Waiting // Current // Transferred // Cancelled)
	EndServeDT DATETIME2, --only with Served//Not-Served//Not-Attended
	ServingTime INT, --in seconds Only increment with Hold
	QCurrent BIT,
	QCall Bit, -- true for first time to call the ticket then to be false , in case call again to change to true then false
	QTransfer BIT,  -- to be used for NQTransfer Not for OQTransfer
	NQTransferredFrom NVARCHAR(50), --  DeptName that Makes the Transfer for this New Q 
	NQTransferredBy NVARCHAR(100) , -- The User Who Makes The Transfer for this New Q 
	TransferedFrom INT, -- The Primary Key for the original Q
	UniqueNo NVARCHAR(50),
	ProvUserID INT, --The Employee Served the Customer 
	EstUserNo INT,
	EstServingTime INT,
	CallTime DATETIME2,
	OQTransferred BIT, -- To Know i'ts transferred to other Dept for OLD Q 
	OQTransferredBy NVARCHAR(100), -- The Name of Employee who make the Trans for OLD Q 
	OQTransferredTo NVARCHAR(50), -- The Name of Department ,these data for info only no need for ID for OLD Q 
	OQTransferDT DATETIME2,
	CONSTRAINT PK_MainQueue PRIMARY KEY CLUSTERED (QID)
)
CREATE TABLE QueueDetails
(
	QID INT,
	DeptID INT,
	ServID INT,
	ServCount INT,
	Notes NVARCHAR(max),
	CONSTRAINT PK_QueueDetails PRIMARY KEY CLUSTERED (QID,DeptID,ServID)
)
CREATE TABLE QueueHoldDetails
(
	QID INT,
	StartTime DATETIME2,
	EndTime DATETIME2 NULL,	
	CONSTRAINT PK_QueueHoldDetails PRIMARY KEY CLUSTERED (QID,StartTime)
)
CREATE TABLE ArchiveQueueHoldDetails
(
	QID INT,
	StartTime DATETIME2,
	EndTime DATETIME2 NULL,	
	CONSTRAINT PK_ArchiveQueueHoldDetails PRIMARY KEY CLUSTERED (QID,StartTime)
)
CREATE TABLE ArchiveMainQueue
(
	QID INT NOT NULL,
	UserID INT, -- The Customer who issued the Ticket
	BranchID INT,
	DeptID INT,
	QLetter NCHAR(1),
	QNumber INT,
	ServiceNo NvarChar(6),
	RequestDate DATETIME2,
	VisitDate DATE,
	VisitTime TIME, --(Approx.) updated based on cancelation of previous records
	StartServeDT DATETIME2,
	QStatus NVARCHAR(20), -- (Served // Not-Served // Hold // Pending // Not-Attended)
	EndServeDT DATETIME2, --only with Served//Not-Served//Not-Attended
	ServingTime INT, --in seconds Only increment with Hold
	QCurrent BIT,
	QCall Bit, -- true for first time to call the ticket then to be false , in case call again to change to true then false
	QTransfer BIT,  -- to be used for NQTransfer Not for OQTransfer
	NQTransferredFrom NVARCHAR(50), --  DeptName that Makes the Transfer for this New Q 
	NQTransferredBy NVARCHAR(100) , -- The User Who Makes The Transfer for this New Q 
	TransferedFrom INT, -- The Primary Key for the original Q
	UniqueNo NVARCHAR(50),
	ProvUserID INT, --The Employee Served the Customer 
	CallTime DATETIME2,
	OQTransferred BIT, -- To Know i'ts transferred to other Dept for OLD Q 
	OQTransferredBy NVARCHAR(100), -- The Name of Employee who make the Trans for OLD Q 
	OQTransferredTo NVARCHAR(50), -- The Name of Department ,these data for info only no need for ID for OLD Q 
	OQTransferDT DATETIME2,
	CONSTRAINT PK_ArchMainQueue PRIMARY KEY CLUSTERED (QID)
)
CREATE TABLE ArchiveQueueDetails
(
	QID INT,
	DeptID INT,
	ServID INT,
	ServCount INT,
	Notes NVARCHAR(max),
	CONSTRAINT PK_ArchQueueDetails PRIMARY KEY CLUSTERED (QID,DeptID,ServID)
)
GO
ALTER TABLE dbo.Branch ADD CONSTRAINT FK_Branch_Company FOREIGN KEY (CompID) REFERENCES dbo.Company(CompID)
ALTER TABLE dbo.CompDept ADD CONSTRAINT FK_CompDept_Company FOREIGN KEY (CompID) REFERENCES dbo.Company(CompID)
ALTER TABLE dbo.BranchDepts ADD CONSTRAINT FK_BranchDepts_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID)
ALTER TABLE dbo.BranchDepts ADD CONSTRAINT FK_BranchDepts_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.DeptServices ADD CONSTRAINT FK_DeptServices_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_Company FOREIGN KEY (CompID) REFERENCES dbo.Company(CompID)
ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID)
ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_Users FOREIGN KEY (ManagerID) REFERENCES dbo.Users(UserID)
ALTER TABLE dbo.UserDepts ADD CONSTRAINT FK_UserDepts_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.UserDepts ADD CONSTRAINT FK_UserDepts_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
ALTER TABLE dbo.MainQueue ADD CONSTRAINT FK_MainQueue_Users_customer FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
ALTER TABLE dbo.MainQueue ADD CONSTRAINT FK_MainQueue_Users_provider FOREIGN KEY (ProvUserID) REFERENCES dbo.Users(UserID)
ALTER TABLE dbo.MainQueue ADD CONSTRAINT FK_MainQueue_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.MainQueue ADD CONSTRAINT FK_MainQueue_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID)
ALTER TABLE dbo.QueueDetails ADD CONSTRAINT FK_QueueDetails_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.QueueDetails ADD CONSTRAINT FK_QueueDetails_MainQueue FOREIGN KEY (QID) REFERENCES dbo.MainQueue(QID)
ALTER TABLE dbo.QueueDetails ADD CONSTRAINT FK_QueueDetails_DeptServices FOREIGN KEY (ServID) REFERENCES dbo.DeptServices(ServID)
ALTER TABLE dbo.QueueHoldDetails ADD CONSTRAINT FK_QueueHoldDetails_MainQueue FOREIGN KEY (QID) REFERENCES dbo.MainQueue(QID)
-------------------------------------------
ALTER TABLE dbo.ArchiveMainQueue ADD CONSTRAINT FK_ArchMainQueue_Users_customer FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
ALTER TABLE dbo.ArchiveMainQueue ADD CONSTRAINT FK_ArchMainQueue_Users_provider FOREIGN KEY (ProvUserID) REFERENCES dbo.Users(UserID)
ALTER TABLE dbo.ArchiveMainQueue ADD CONSTRAINT FK_ArchMainQueue_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.ArchiveMainQueue ADD CONSTRAINT FK_ArchMainQueue_Branch FOREIGN KEY (BranchID) REFERENCES dbo.Branch(BranchID)
ALTER TABLE dbo.ArchiveQueueDetails ADD CONSTRAINT FK_ArchQueueDetails_CompDept FOREIGN KEY (DeptID) REFERENCES dbo.CompDept(DeptID)
ALTER TABLE dbo.ArchiveQueueDetails ADD CONSTRAINT FK_ArchQueueDetails_ArchiveMainQueue FOREIGN KEY (QID) REFERENCES dbo.ArchiveMainQueue(QID)
ALTER TABLE dbo.ArchiveQueueDetails ADD CONSTRAINT FK_ArchQueueDetails_DeptServices FOREIGN KEY (ServID) REFERENCES dbo.DeptServices(ServID)
GO


CREATE PROC AuthenticateUser
@LoginName NVARCHAR(50), @UserPass NVARCHAR(50) AS
IF EXISTS (SELECT TOP 1 UserID FROM dbo.Users WHERE Email=@LoginName)
BEGIN
	DECLARE @userID INT
	SET @userID=(SELECT UserID FROM dbo.Users WHERE Email=@LoginName 
	AND hashPass=HASHBYTES('SHA2_512', @UserPass+CAST(Salt AS NVARCHAR(36))))

       IF(@userID IS NULL)
           SELECT 'Authentication failed. Wrong password.' AS Error
       ELSE 
           SELECT UserID, UserName, u.CompID, u.BranchID, UserRole, EntityType, Salt ,Window ,b.DefaultLang ,b.AudioLang 
		   FROM dbo.Users u left join dbo.Branch b
		   ON u.BranchID = b.BranchID 
		   WHERE UserID = @userID
END
ELSE
    SELECT 'Authentication failed. User not found.' AS Error
GO


DECLARE @Salt UNIQUEIDENTIFIER = NEWID()
INSERT dbo.Users
        ( UserName ,Email ,hashPass ,Salt ,UserRole )
VALUES  ( N'Admin' , -- UserName - nvarchar(200)
          N'admin@admin.com' , -- LoginName - nvarchar(50)
          HASHBYTES('SHA2_512', N'123456' + CAST(@Salt AS NVARCHAR(36))) , -- hashPassword - binary
          @Salt  -- Salt - uniqueidentifier
		  ,'SysAdmin'
        )	
GO

CREATE PROC RegisterUser
@CompID INT, @BranchID INT, @UserName NVARCHAR(200), @UserPass NVARCHAR(50), @UserRole NVARCHAR(50), @EntityType TINYINT,
@ManagerID INT, @Phone NVARCHAR(50),@Mobile NVARCHAR(50),@Email NVARCHAR(200), @Title NVARCHAR(200),@Disabled bit
AS
DECLARE @Salt UNIQUEIDENTIFIER = NEWID()
INSERT dbo.Users
        ( CompID ,BranchID ,UserName ,UserRole ,EntityType ,ManagerID ,Phone ,Mobile ,Email ,Title, 
		hashPass, Salt )
VALUES  ( @CompID, @BranchID, @UserName, @UserRole, @EntityType,  @ManagerID, @Phone, @Mobile, @Email, @Title, 
		HASHBYTES('SHA2_512', @UserPass+CAST(@Salt AS NVARCHAR(36))), @Salt )
GO
-------------------------------------------------------------------
----------------Alter CompanyInsert 
CREATE PROC CompanyInsert
@UserID INT,@CompName nvarchar(300),@Country nvarchar(100), @City nvarchar(100), 
@CompType nvarchar(50),@CompAddress nvarchar(max),@Phone nvarchar(50),@Mobile nvarchar(50),
@Website nvarchar(50),@Email nvarchar(200),@Fax nvarchar(200),@Description nvarchar(max),
@WorkField nvarchar(100),@DefaultLanguage nvarchar(20),@Disabled bit ,@MaxPend INT 
AS
DECLARE @CompID INT
-----Create New Company
INSERT dbo.Company
(CompName,Country,City,CompType,CompAddress,Phone,Mobile,Website,Email,Fax,Description,WorkField, DefaultLanguage,Disabled,MaxPend)
Values	
(@CompName,@Country,@City,@CompType,@CompAddress,@Phone,@Mobile,@Website,@Email,@Fax,@Description,@WorkField,@DefaultLanguage,@Disabled,@MaxPend);
-----SELECT CompID 
SELECT @CompID = IDENT_CURRENT('dbo.Company');
-----Update CompID in CompAdmin User
UPDATE dbo.Users 
SET CompID = @CompID 
WHERE UserID = @UserID;
select IDENT_CURRENT('dbo.Company') AS CompId
GO
-------------------------------------------------------------------
CREATE PROC	CompanyUpdate
@CompId INT ,@CompName nvarchar(300),@Country nvarchar(100), @City nvarchar(100)
,@CompAddress nvarchar(max),@Phone nvarchar(50),@Mobile nvarchar(50),
@Website nvarchar(50),@Email nvarchar(200),@Fax nvarchar(200),@Description nvarchar(max),
@WorkField nvarchar(100),@DefaultLanguage nvarchar(20),@MaxPend INT AS
UPDATE dbo.Company 
SET 
CompName = @CompName , Country = @Country , City = @City , 
CompAddress = @CompAddress , Phone = @Phone, Mobile = @Mobile , Website = @Website ,
Email = @Email , Fax = @Fax , [Description] = @Description , WorkField = @WorkField,
DefaultLanguage = @DefaultLanguage , MaxPend = @MaxPend
WHERE CompID = @CompId
GO

CREATE PROC CompanyValidate
@CompId INT,@Disabled bit AS
UPDATE dbo.Company
SET 
[Disabled] = @Disabled
WHERE CompID = @CompId
GO

CREATE PROC CompanyDelete
@CompId INT AS
DELETE dbo.Company
WHERE CompID = @CompId
GO
CREATE Function LPAD(@Num INT, @Replace Char(1), @Length INT)
Returns NvarChar(max)
begin
	Declare @Out NvarChar(max) = right(replicate(@Replace,@Length)+cast(@Num as varchar(15)),@Length)
	Return @Out
end
GO

CREATE TYPE tpQueueDetails AS TABLE
(
	QID INT,
	DeptID INT,
	ServID INT,
	ServCount INT,
	Notes NVARCHAR(max)
)
GO
CREATE PROC UpdateVisitTime (@QID INT, @BranchID INT, @DeptID INT, @VisitDate DATE) 
AS
	DECLARE @OpenTime TIME='08:00:00', @Order INT, @VisitTime TIME, @UserNO INT= 0
	DECLARE @UserCount INT = (SELECT COUNT(ud.UserID) FROM dbo.UserDepts ud JOIN dbo.Users u ON u.UserID = ud.UserID 
		WHERE DeptID = @DeptID AND u.BranchID=@BranchID)

	DECLARE @tbl TABLE (QID INT, BranchID INT, ServiceNo NVARCHAR(10), VisitTime TIME, QStatus NVARCHAR(20), EstUserNo INT,
		EstServingTime INT)
	INSERT @tbl 
	SELECT QID, BranchID, ServiceNo, VisitTime, QStatus, EstUserNo, EstServingTime 
	FROM dbo.MainQueue WHERE BranchID=@BranchID AND DeptID=@DeptID AND VisitDate=@VisitDate 

	SELECT @Order = STK.QOrder FROM ( 
	SELECT QID, QStatus, ROW_NUMBER() OVER ( ORDER BY QID ) AS QOrder  FROM @tbl ) STK WHERE STK.QID = @QID
	IF (@Order = 1) 
		BEGIN
			SET @VisitTime = @OpenTime 
			SET @UserNO = 1
		END
		ELSE	
			IF (@UserCount >= @Order) 
			BEGIN
				SET @VisitTime = @OpenTime 
				IF ( @UserNO < @UserCount ) 
				BEGIN
					SET @UserNO = (SELECT MAX(EstUserNo) + 1 FROM @tbl)
				END
			END		
			ELSE
			BEGIN
				SELECT TOP 1 @VisitTime = QRY.VisTime, @UserNO = QRY.EstUserNo FROM (
				SELECT MAX(DATEADD(MINUTE, EstServingTime, VisitTime)) VisTime, EstUserNo 
				FROM @tbl WHERE VisitTime IS NOT NULL
				GROUP BY EstUserNo ) QRY ORDER BY QRY.VisTime ASC	
			END
	UPDATE dbo.MainQueue SET VisitTime= @VisitTime, EstUserNo=@UserNO WHERE QID=@QID
GO

CREATE Proc IssueTicket
	@CompID int, @DeptID INT, @BranchID INT, @UserID INT, @VisitDate DATE, @QueueDetails tpQueueDetails READONLY
as
	DECLARE @ServSerial INT,  @VisTime TIME, @cQID INT 
	Select @ServSerial= ISNULL(MAX(QNumber), 0) +1 FROM MainQueue Where BranchID=@BranchID and DeptID=@DeptID AND VisitDate = @VisitDate
	DECLARE @ServLetter nvarchar(5) = (Select Letter From CompDept Where DeptID=@DeptID )
	DECLARE @TotSrvTime INT = (SELECT SUM(ServCount * s.ServTime) FROM @QueueDetails q JOIN dbo.DeptServices s ON s.ServID = q.ServID)
	DECLARE @VIP BIT = (SELECT CAST(ISNULL(CompID, 0) AS BIT) FROM dbo.Company WHERE CompID = @UserID)

	INSERT MainQueue 
			(BranchID, DeptID, VisitDate, VisitTime, UserID, QLetter, QNumber, RequestDate, QStatus, UniqueNo, EstServingTime)
	VALUES (@BranchID, @DeptID, @VisitDate, DATEADD(MINUTE, 20, @VisTime), @UserID, @ServLetter, dbo.LPAD(@ServSerial, '0', 4), GETDATE(), 
			'Waiting', ABS(CAST(NEWID() AS binary(6)) % 10000) + 1, @TotSrvTime)
	SELECT @cQID = IDENT_CURRENT('MainQueue') From MainQueue 

	EXEC dbo.UpdateVisitTime @QID = @cQID, -- int
		@BranchID = @BranchID, -- int
		@DeptID = @DeptID, -- int
		@VisitDate = @VisitDate -- date

	INSERT dbo.QueueDetails
			( QID, DeptID, ServID, ServCount, Notes )
	SELECT @cQID, DeptID, ServID, ServCount, Notes FROM @QueueDetails

	Select QID, ServiceNo, UniqueNo, VisitTime, EstUserNo, @VIP VIP From MainQueue Where QID = @cQID
GO

CREATE PROC UserCompanyUpdate
@UserID INT,@CompID INT AS 
UPDATE dbo.Users 
SET 
CompID = @CompID
WHERE UserID = @UserID
GO

Create Proc CompanySetupStatus
@id int
AS
Declare @Comp INT ,@Depts INT, @Brnchs INT ,@Users INT;
BEGIN
SELECT @Comp = count(CompID) from dbo.Company where CompID = @id;
SELECT @Depts = count(CompID) from dbo.CompDept where CompID = @id;
SELECT @Brnchs = count(CompID) from dbo.Branch where CompID = @id;

SELECT @Users = count(CompID) 
From dbo.Users 
Where CompID = @id
And UserRole !='CompAdmin';

SELECT @Comp as Comp,@Depts as Dept,@Brnchs as Brnch,@Users as Usrs;
END
Go

-- Create Type for DeptServices 
Create Type dbo.DeptServices AS Table(
	DeptID INT,
	ServName NVARCHAR(300),
	[Disabled] BIT  -- For CompanyAdmin Use	
)
GO
-----------------------------------------------------------------------
CREATE PROC CompDeptInsert
@CompID INT,@DeptName nvarchar(100),@RangeFrom INT,@RangeTo INT,
@Letter nchar(1),@Disabled bit ,@deptServices deptServices READONLY
As
Declare @CompDeptId Int;
Begin

INSERT dbo.CompDept
(CompID,DeptName,RangeFrom,RangeTo,Letter,Disabled)
Values	
(@CompID,@DeptName,@RangeFrom,@RangeTo,@Letter,@Disabled);

Select @CompDeptId = IDENT_CURRENT('dbo.CompDept') ;

INSERT dbo.DeptServices
(ServName,DeptID,Disabled)
SELECT ServName,@CompDeptId,Disabled from @deptServices;
Select @CompDeptId as DeptID
End
GO
-----------------------------------------------------------------------
CREATE PROC CompDeptUpdate
@DeptID INT,@CompID INT,@DeptName nvarchar(100),@RangeFrom INT,@RangeTo INT,
@Letter nchar(1),@Disabled bit 
As
Begin
Update dbo.CompDept 
Set DeptName = @DeptName 
,RangeFrom = @RangeFrom
,RangeTo = @RangeTo
,Letter = @Letter
,Disabled = @Disabled
Where DeptID = @DeptID
And CompID = @CompID
SELECT * from CompDept WHERE DeptID = @DeptID;
End
GO
-----------------------------------------------------------------------
CREATE PROC DeptServInsert
@DeptID INT,@ServName nvarchar(100),@Disabled bit
As
INSERT dbo.DeptServices
(DeptID,ServName,Disabled)
Values	
(@DeptID,@ServName,@Disabled)
select IDENT_CURRENT('dbo.DeptServices') AS ServId
GO
-----------------------------------------------------------------------
CREATE PROC DeptServUpdate
@DeptID INT ,@ServID INT, @ServName nvarchar(100),@Disabled bit
As
UPDATE dbo.DeptServices
Set ServName = @ServName 
,Disabled = @Disabled
Where DeptID = @DeptID 
And ServID = @ServID;
Select * from dbo.DeptServices Where ServID = @ServID;
Go
---------------------------------------------------------------------
-- Create Type for BranchDept 
CREATE Type dbo.BranchDepts AS Table(
	BranchID INT,
	DeptID INT
)
GO
-----------------------------------------------------------------------
CREATE PROC BrnchDeptInsert
@CompID INT,@BranchName nvarchar(100),@Country nvarchar(100),@City nvarchar(100),
@BranchAddress nvarchar(100),@Phone nvarchar(50),@Mobile nvarchar(50),@Email nvarchar(200),
 @Fax nvarchar(50),@Disabled bit ,@BranchDepts BranchDepts READONLY
As
Declare @BrnchId Int;
Begin

INSERT dbo.Branch
(CompID,BranchName,Country,City,BranchAddress,Phone,Mobile,Email,Fax,Disabled)
Values	
(@CompID,@BranchName,@Country,@City,@BranchAddress,@Phone,@Mobile,@Email,@Fax,@Disabled);

Select @BrnchId = IDENT_CURRENT('dbo.Branch') ;

INSERT dbo.BranchDepts
(BranchID,DeptID)
SELECT @BrnchId,DeptID from @BranchDepts;
Select @BrnchId as BrnchID
End
GO
---------------------------------------------------------------------------------------
CREATE PROC BrnchDeptUpdate
@BranchID INT,@CompID INT,@BranchName nvarchar(100),@Country nvarchar(100),@City nvarchar(100),
@BranchAddress nvarchar(100),@Phone nvarchar(50),@Mobile nvarchar(50),@Email nvarchar(200),
 @Fax nvarchar(50),@Disabled bit ,@BranchDepts BranchDepts READONLY
As
Begin

UPDATE dbo.Branch
SET BranchName = @BranchName , Country = @Country , City = @City ,BranchAddress = @BranchAddress
,Phone = @Phone , Mobile = @Mobile , Email = @Email ,Fax = @Fax , Disabled = @Disabled
Where BranchID = @BranchID
And CompID = @CompID;

Delete From dbo.BranchDepts Where BranchID = @BranchID;

INSERT dbo.BranchDepts
(BranchID,DeptID)
SELECT @BranchID,DeptID from @BranchDepts;
Select @BranchID as BrnchID
End
GO


---------------------------------------------------------------------
-- Create Type for UserDept 
CREATE Type dbo.UserDepts AS Table(
	UserID INT,
	DeptID INT
)
GO
-----------------------------------------------------------------------
CREATE PROC CompUserInsert
@CompID INT,@BranchID INT,@ManagerID INT NULL,@UserName nvarchar(100),@UserPass nvarchar(100),@UserRole nvarchar(100),
@EntityType tinyint,@Phone nvarchar(50),@Mobile nvarchar(50),@Email nvarchar(200),
@Title nvarchar(200),@Disabled bit ,@UserDepts UserDepts READONLY
As
SET Transaction ISOLATION LEVEL READ UNCOMMITTED
Declare @UserId Int;
Begin
--------- Insert User Info in dbo.Users
EXEC RegisterUser @CompID,@BranchID,@UserName,@UserPass,@UserRole,@EntityType,@ManagerID,@Phone,@Mobile,@Email,@Title,@Disabled ;
--------- Select @UserID
SELECT @UserId = IDENT_CURRENT('dbo.Users') ;
--------- Insert User's Departments
INSERT dbo.UserDepts
		(UserID, DeptID)
SELECT @UserId , DeptID FROM @UserDepts;

SELECT @UserId as UserID;
End
GO
---------------------------------------------------------------------------------------
CREATE PROC CompUserUpdate
@UserId INT,@CompID INT,@BranchID INT,@ManagerID INT NULL,@UserName nvarchar(100),@UserRole nvarchar(100),
@Phone nvarchar(50),@Mobile nvarchar(50),@Email nvarchar(200),
@Title nvarchar(200),@Disabled bit ,@UserDepts UserDepts READONLY
As
SET Transaction ISOLATION LEVEL READ UNCOMMITTED
Begin
--Update User Info--
UPDATE dbo.Users 
SET BranchID = @BranchID ,
ManagerID = @ManagerID ,
UserName = @UserName ,
UserRole = @UserRole,
Phone = @Phone,
Mobile = @Mobile ,
Email = @Email , 
Title = @Title, 
Disabled = @Disabled 
WHERE UserID = @UserId 
AND CompID = @CompID;
--Delete User Depts--
DELETE dbo.UserDepts Where UserID = @UserId;
--Insert User New Depts--
INSERT dbo.UserDepts 
		(UserID, DeptID)
SELECT @UserId , DeptID FROM @UserDepts;
SELECT @UserId as UserID;
End
GO
--------------------------------------------------------------------------------------------
CREATE PROC BrnchUsersSelect
@CompID INT
AS
SELECT b.BranchID , b.BranchName 
,bd.DeptID as bdDeptID,bd.BranchID as bdBranchID,cd.DeptName
,u.UserID,u.BranchID as uBranchID,u.UserName,u.Email,u.Title
,u.UserRole,u.ManagerID,u.Phone,u.Mobile,u.Disabled
,ud.DeptID as uDeptID 
FROM dbo.Branch b left join dbo.Users u
ON b.BranchID = u.BranchID
AND b.CompID = @CompID
JOIN dbo.BranchDepts bd 
ON b.BranchID = bd.BranchID
JOIN dbo.CompDept cd 
ON bd.DeptID = cd.DeptID
LEFT JOIN dbo.UserDepts ud 
ON u.UserID = ud.UserID
and bd.DeptID = ud.DeptID
GO
-----------------------------------------------------
-------SP Updated----------
CREATE PROC TicketUpdate
@QID INT ,@QStatus NVARCHAR(20),@QCurrent BIT NULL
,@QTransfer BIT NULL ,@ProvUserID INT ,@Qtask NVARCHAR(40),@FirstPendQ INT
AS
IF @Qtask ='NEXT'
	Begin
		IF @QTransfer = 0
			Begin
				UPDATE dbo.MainQueue 
				SET 
				QStatus = 'Pending'
				,QCurrent =0
				WHERE QSTATUS = 'Current'
				AND StartServeDT IS NULL 
				AND ProvUserID = @ProvUserID;

				UPDATE dbo.MainQueue 
				SET 		
				QStatus = @QStatus ,
				QCurrent = @QCurrent ,		
				ProvUserID = @ProvUserID,
				CallTime = GETDATE()
				WHERE QID = @QID
				AND QStatus = 'Waiting';

				UPDATE dbo.MainQueue
				SET
				QStatus = 'NotAttended'
				WHERE QID = @FirstPendQ; 
			END
		ELSE 
			BEGIN			
				UPDATE dbo.MainQueue 
				SET 
				QStatus = 'NotAttended'
				,QCurrent =0
				WHERE QSTATUS = 'Current'
				AND StartServeDT IS NULL 
				AND ProvUserID = @ProvUserID;

				UPDATE dbo.MainQueue 
				SET 		
				QStatus = @QStatus ,
				QCurrent = @QCurrent ,		
				ProvUserID = @ProvUserID,
				CallTime = GETDATE()
				WHERE QID = @QID
				AND QStatus = 'Transferred';		
			END
END
ELSE IF @Qtask ='START'
	BEGIN
		UPDATE dbo.MainQueue 
		SET 
		StartServeDT = GETDATE(),		
		QStatus = @QStatus,
		QCurrent = @QCurrent ,		
		ProvUserID = @ProvUserID		
		WHERE QID = @QID
		AND QStatus in ('Pending','Current');
	END
ELSE IF @Qtask in ('STOP' ,'HOLD')
	BEGIN
		UPDATE dbo.MainQueue 
		SET 
		EndServeDT = GETDATE(),		
		QStatus = @QStatus,
		QCurrent = @QCurrent,
		ServingTime = DATEDIFF(second,StartServeDT,GETDATE())
		WHERE QID = @QID
		AND QStatus in ('Current')
		AND ProvUserID = @ProvUserID;
	END
ELSE IF @Qtask = 'RESUMEQ'
	BEGIN
		UPDATE dbo.MainQueue 
		SET 		
		QStatus = @QStatus,
		QCurrent = @QCurrent 		
		WHERE QID = @QID
		AND QStatus in ('Hold')
		AND ProvUserID = @ProvUserID;
		
		INSERT INTO dbo.QueueHoldDetails
			(QID,StartTime,EndTime)
		VALUES 
			(@QID , GETDATE(),NULL);
	END
ELSE IF @Qtask = 'ENDQ'
	BEGIN
		UPDATE dbo.MainQueue 
		SET 		
		QStatus = @QStatus,
		QCurrent = @QCurrent 		
		WHERE QID = @QID
		AND QStatus in ('Hold')
		AND ProvUserID = @ProvUserID;
		
		UPDATE dbo.QueueHoldDetails
		SET EndTime = GETDATE()
		WHERE QID = @QID AND EndTime is null;	

		UPDATE dbo.MainQueue
		SET ServingTime = (
			(DATEDIFF(second,StartServeDT,EndServeDT)) + 
			(Select Sum(DATEDIFF(second,StartTime,EndTime)) From QueueHoldDetails Where QID = @QID)
		)
		Where QID = @QID;
	END
SELECT @QID ; 
GO
-----------------------------------------------------
---------------Transfer -----------------------------
CREATE PROC QTransfer 
@QID INT ,@DeptID INT ,@NQTransferredFrom NVARCHAR(50),@NQTransferredBy NVARCHAR(100),
@OQTransferredBy NVARCHAR(100) ,@OQTransferredTo NVARCHAR(50),
@QueueDetails tpQueueDetails READONLY
AS
DECLARE @NQID INT;
DECLARE @TransBefore BIT;

SELECT @TransBefore = ISNULL(OQTransferred,0) From dbo.MainQueue WHERE QID = @QID;
IF @TransBefore = 0 
	BEGIN
		--1-- Update The Old Q 
		UPDATE dbo.MainQueue 
		SET 
		OQTransferred = 1,
		OQTransferredBY = @OQTransferredBy,
		OQTransferredTo = @OQTransferredTo,
		OQTransferDT = GETDATE()
		WHERE QID = @QID ;

		--2-- Insert The New Q 
		INSERT dbo.MainQueue 
		(UserID,BranchID,DeptID,QLetter,QNumber,RequestDate,VisitDate,
		VisitTime,QStatus,QTransfer,UniqueNo,NQTransferredFrom,NQTransferredBy)
		(SELECT 
		UserID,BranchID,@DeptID,QLetter,QNumber,GETDATE(),VisitDate,
		VisitTime,'Transferred',1,UniqueNo,@NQTransferredFrom,@NQTransferredBy
		FROM dbo.MainQueue
		WHERE QID = @QID
		);

		--3-- SELECT The Insert QID
		SELECT @NQID = IDENT_CURRENT('MainQueue');

		--4-- INSERTING The QDTls for Transferred Q 
		INSERT dbo.QueueDetails
		( QID, DeptID, ServID, ServCount, Notes )
		SELECT @NQID, DeptID, ServID, ServCount, Notes FROM @QueueDetails;
	END
		SELECT IDENT_CURRENT('MainQueue')AS QID;
GO
-----------------------------------------------------
CREATE PROC EndDay
AS
UPDATE dbo.MainQueue SET QStatus = 'Not-Attended' WHERE VisitDate < CAST(GETDATE() AS DATE) AND QStatus IN ('Waiting', 'Pending')
UPDATE dbo.MainQueue SET QStatus = 'Served' WHERE VisitDate < CAST(GETDATE() AS DATE) AND QStatus IN ('Hold')

INSERT dbo.ArchiveMainQueue
        ( QID, UserID, BranchID, DeptID, QLetter, QNumber, ServiceNo, RequestDate, VisitDate, VisitTime, StartServeDT, QStatus,
			EndServeDT, ServingTime, QCurrent, QTransfer, NQTransferredFrom, NQTransferredBy, TransferedFrom, UniqueNo, 
			ProvUserID, CallTime, OQTransferred, OQTransferredBy, OQTransferredTo, OQTransferDT )
SELECT QID, UserID, BranchID, DeptID, QLetter, QNumber, ServiceNo, RequestDate, VisitDate, VisitTime, StartServeDT, QStatus,
		EndServeDT, ServingTime, QCurrent, QTransfer, NQTransferredFrom, NQTransferredBy, TransferedFrom, UniqueNo, 
		ProvUserID, CallTime, OQTransferred, OQTransferredBy, OQTransferredTo, OQTransferDT
FROM dbo.MainQueue WHERE VisitDate < CAST(GETDATE() AS DATE) 
--------------------
INSERT dbo.ArchiveQueueDetails ( QID, DeptID, ServID, ServCount, Notes ) 
SELECT QID, DeptID, ServID, ServCount, Notes  FROM dbo.QueueDetails 
WHERE QID IN (SELECT QID FROM dbo.MainQueue WHERE VisitDate < CAST(GETDATE() AS DATE))

INSERT dbo.ArchiveQueueHoldDetails
        ( QID, StartTime, EndTime )
SELECT QID, StartTime, EndTime  FROM dbo.QueueHoldDetails
WHERE QID IN (SELECT QID FROM dbo.MainQueue WHERE VisitDate < CAST(GETDATE() AS DATE))

--------------------
DELETE dbo.QueueHoldDetails WHERE QID IN (SELECT QID FROM dbo.MainQueue WHERE VisitDate < CAST(GETDATE() AS DATE))
DELETE dbo.QueueDetails WHERE QID IN (SELECT QID FROM dbo.MainQueue WHERE VisitDate < CAST(GETDATE() AS DATE))
DELETE dbo.MainQueue WHERE VisitDate < CAST(GETDATE() AS DATE) 
GO
-------------------------------------------------------------------------
CREATE VIEW vwActiveTickets 
AS
SELECT QID ,q.UserID, u.UserName ,q.BranchID, b.BranchName ,q.DeptID, d.DeptName ,QLetter ,QNumber ,ServiceNo ,RequestDate ,VisitDate ,VisitTime ,
       QStatus ,QCurrent ,QTransfer ,UniqueNo , b.BranchAddress ,EstUserNo ,EstServingTime ,c.CompID, c.CompName
FROM MainQueue q 
JOIN dbo.Users u ON u.UserID = q.UserID
JOIN dbo.CompDept d ON d.DeptID = q.DeptID
JOIN dbo.Branch b ON b.BranchID = q.BranchID
JOIN dbo.Company c ON c.CompID = b.CompID
WHERE QStatus NOT IN ('Served', 'Cancelled', 'Not-Attended', 'Transferred') 
GO

CREATE VIEW vwActiveTicketsServices
AS
SELECT q.QID, q.UserID, qd.ServID, s.ServName, qd.ServCount, qd.Notes 
FROM MainQueue q 
JOIN dbo.QueueDetails qd ON qd.QID = q.QID
JOIN dbo.DeptServices s ON s.ServID = qd.ServID
WHERE QStatus NOT IN ('Served', 'Cancelled', 'Not-Attended', 'Transferred') 
GO


-------------------------------------------------------------------------
-----------View Updated-----------------------
CREATE VIEW vwDailyTickets 
AS
SELECT QID ,q.UserID , cu.CompName as cCompName, u.UserName as cUserName,q.BranchID, b.BranchName ,q.DeptID, d.DeptName ,QLetter ,QNumber ,ServiceNo ,RequestDate ,VisitDate ,VisitTime 
,StartServeDT,EndServeDT,ServingTime,QStatus ,QCurrent ,QTransfer ,UniqueNo , b.BranchAddress ,EstUserNo ,EstServingTime ,c.CompID, c.CompName ,q.ProvUserID,p.UserName as pUserName
,q.CallTime,q.NQTransferredBy,q.NQTransferredFrom,q.OQTransferDT,q.OQTransferred,q.OQTransferredBy,q.OQTransferredTo
FROM MainQueue q 
JOIN dbo.Users u ON u.UserID = q.UserID
JOIN dbo.CompDept d ON d.DeptID = q.DeptID
JOIN dbo.Branch b ON b.BranchID = q.BranchID
JOIN dbo.Company c ON c.CompID = b.CompID
JOIN
(SELECT u.UserID , CompName 
FROM dbo.Users u JOIN dbo.Branch b
ON u.BranchID = b.BranchID
JOIN dbo.Company c 
ON b.CompID = c.CompID) cu
ON cu.UserID = q.UserID
LEFT JOIN (SELECT UserID ,UserName FROM dbo.Users) p
on p.UserID = q.ProvUserID
GO

CREATE VIEW vwDailyTicketsServices
AS
SELECT q.QID, q.UserID, qd.ServID, s.ServName, qd.ServCount, qd.Notes 
FROM MainQueue q 
JOIN dbo.QueueDetails qd ON qd.QID = q.QID
JOIN dbo.DeptServices s ON s.ServID = qd.ServID
GO
--------------------------------------20-1-2018--------------------------------------------
-------------------------------------------------------------------------
CREATE VIEW vwAllQueue
AS
SELECT QID, UserID, BranchID, DeptID, ServiceNo, RequestDate, VisitDate, VisitTime, StartServeDT, EndServeDT, 
	QStatus, ServingTime, QCurrent, QTransfer, TransferedFrom, UniqueNo, ProvUserID 
FROM dbo.MainQueue
UNION ALL
SELECT QID, UserID, BranchID, DeptID, ServiceNo, RequestDate, VisitDate, VisitTime, StartServeDT, EndServeDT, 
	QStatus, ServingTime, QCurrent, QTransfer, TransferedFrom, UniqueNo, ProvUserID 
FROM dbo.ArchiveMainQueue
GO
Alter VIEW vwAllQueueDetails
AS
SELECT QID, qd.ServID, ServName, ServCount, Notes
FROM dbo.QueueDetails qd
JOIN dbo.DeptServices s ON s.ServID = qd.ServID
UNION ALL
SELECT QID, qd.ServID, ServName, ServCount, Notes
FROM dbo.ArchiveQueueDetails qd
JOIN dbo.DeptServices s ON s.ServID = qd.ServID
GO
-------------------------------------------------------------------------
CREATE PROC CancelTicket 
(@QID INT) AS
UPDATE dbo.MainQueue SET QStatus = 'Cancelled' WHERE QID=@QID
GO
-------------------------------------------------------------------------
Alter PROC SearchUserTickets
@UserID INT, @CompID INT, @BranchID INT, @DeptID INT, @ServID INT, @VisitFromDate NvarChar(12), @VisitToDate nVarChar(12)
AS
DECLARE @str NVARCHAR(max)= 
	'SELECT q.QID ,q.UserID, u.UserName ,q.BranchID, b.BranchName ,q.DeptID, d.DeptName ,ServiceNo ,RequestDate ,VisitDate ,VisitTime ,
		   QStatus ,QCurrent ,QTransfer ,UniqueNo , b.BranchAddress ,c.CompID, c.CompName
	FROM dbo.vwAllQueue q 
	--LEFT JOIN dbo.vwAllQueueDetails qd ON qd.QID = q.QID
	JOIN dbo.Users u ON u.UserID = q.UserID
	JOIN dbo.CompDept d ON d.DeptID = q.DeptID
	JOIN dbo.Branch b ON b.BranchID = q.BranchID
	JOIN dbo.Company c ON c.CompID = b.CompID
	WHERE q.UserID = ' + CAST(@UserID AS VARCHAR(9))
	IF (@VisitFromDate IS NOT NULL)
	BEGIN
		SET @str += ' AND Cast(VisitDate as DATE) Between ' + '''' + CONVERT(VARCHAR(12), @VisitFromDate) + '''' + 
			' And ' + '''' + CONVERT(VARCHAR(12), @VisitToDate) + ''''
	END
	IF (@CompID IS NOT NULL)
	BEGIN
		SET @str += ' And c.CompID= ' + CAST(@CompID AS VARCHAR(9))
	END
	IF (@BranchID IS NOT NULL)
	BEGIN
		SET @str += ' And q.BranchID= ' + CAST(@BranchID AS VARCHAR(9))
	END
	IF (@DeptID IS NOT NULL)
	BEGIN
		SET @str += ' And q.DeptID= ' + CAST(@DeptID AS VARCHAR(9))
	END
	IF (@ServID IS NOT NULL)
	BEGIN
		SET @str += ' And qd.ServID= ' + CAST(@ServID AS VARCHAR(9))
	END

	SET @str += ' ;
	SELECT * FROM dbo.vwAllQueueDetails WHERE QID IN (
	SELECT q.QID 
	FROM dbo.vwAllQueue q
	JOIN dbo.Branch b ON b.BranchID = q.BranchID
	JOIN dbo.Company c ON c.CompID = b.CompID
	WHERE q.UserID = ' + CAST(@UserID AS VARCHAR(9))
	IF (@VisitFromDate IS NOT NULL)
	BEGIN
		SET @str += ' AND Cast(VisitDate as DATE) Between ' + '''' + CONVERT(VARCHAR(12), @VisitFromDate) + '''' + 
			' And ' + '''' + CONVERT(VARCHAR(12), @VisitToDate) + ''''
	END
	IF (@CompID IS NOT NULL)
	BEGIN
		SET @str += ' And c.CompID= ' + CAST(@CompID AS VARCHAR(9))
	END
	IF (@BranchID IS NOT NULL)
	BEGIN
		SET @str += ' And q.BranchID= ' + CAST(@BranchID AS VARCHAR(9))
	END
	IF (@DeptID IS NOT NULL)
	BEGIN
		SET @str += ' And q.DeptID= ' + CAST(@DeptID AS VARCHAR(9))
	END
	IF (@ServID IS NOT NULL)
	BEGIN
		SET @str += ' And ServID= ' + CAST(@ServID AS VARCHAR(9))
	END
	SET @str += ' )'

	EXEC sp_executesql @str
GO
-----------------------------------------------------