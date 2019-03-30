const app = getApp();
const db = wx.cloud.database();
const forms = db.collection('forms');
const judge = /\d{11}/;

Page({
  data: {
    index: 0,
    date: app._toDateStr(new Date(), true),
    time1: "07:00",
    time2: "07:00",
    array: ["请选择", "201", "202", "203", "204", "205", "206", "207", "208"]
  },

  onLoad() {
    wx.showModal({
      title: "注意事项",
      content: app.globalData.rule,
      showCancel: false,
      confirmText: "好"
    });

    const PAGE = this; // 使得get回调函数可以访问this.setData
    // 获取db数据
    /*
    db.collection('formid').where({
      name:'latest_id'
    }).get({
      success(e) {
        console.log(e, e.data);
        PAGE.setData({
          formid: e.data[0].formid
        });
        console.log(PAGE.data);
      },
      fail: console.error
    });*/
  },

  /*在线填表页面点击报名的函数*/
  submit: function(e) {
    const formsData = e.detail.value;
    const PAGE = this;

    //TODO:仿照hustauEntrance:join-us中对不同错误给出不同提示

    if (PAGE.data.index === 0 || !judge.test(formsData["phone"])) {
      wx.showModal({
        title: "提交失败",
        content: "请检查表单填写是否正确",
        showCancel: false,
        confirmText: "回去修改"
      });
      return;
    }

    db.collection("forms").orderBy("formid", "desc").limit(2)
      .get().then(res => {
        const maxFormid = res.data[0].formid || new Date().getFullYear() * 100000;
        console.log("The existing max formid is: ", maxFormid);
        forms.add({
          data: {
            formid: maxFormid + 1,
            classroomNumber: PAGE.data.array[PAGE.data.index],
            eventDate: PAGE.data.date,
            eventTime1: PAGE.data.time1,
            eventTime2: PAGE.data.time2,
            event: {
              association: formsData["associationName"],
              attendNumber: Number(formsData["attendNumber"]),
              content: formsData["eventContent"],
              name: formsData["eventName"],
              responser: formsData["eventResponser"],
              tel: formsData["phone"]
            },
            submitDate: new Date(),
            exam: 0
          },
          success(res) {
            console.log("Successfully add to db!");
            wx.showModal({
              title: '提交成功',
              content: '请将策划案发送至公邮 mishu@hustau.com，并耐心等待审核结果',
              success: function(res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
        });
      });
  },

  /*活动日期picker改变的函数*/
  bindDateChange: function(e) {
    console.log("eventDate发送选择改变，携带值为", e.detail.value);
    this.setData({
      date: e.detail.value
    });
  },
  /*活动时间1picker改变的函数*/
  bindTimeChange1: function(e) {
    console.log("[eventTime1] changes", e.detail.value);
    // 检查time2是否大于time1, 若小于则令time2等于time1
    if (this.data.time2 < e.detail.value) {
      this.setData({
        time1: e.detail.value,
        time2: e.detail.value
      });
    } else {
      this.setData({
        time1: e.detail.value
      });
    }
  },
  /*活动时间2picker改变的函数*/
  bindTimeChange2: function(e) {
    console.log("eventTime2发送选择改变，携带值为", e.detail.value);
    this.setData({
      time2: e.detail.value
    })
  },
  /*借用教室picker改变的函数*/
  bindNumberChange: function(e) {
    console.log("classroomNumber发生选择改变，携带值为", e.detail.value)
    this.setData({
      index: e.detail.value
    })
  }
});